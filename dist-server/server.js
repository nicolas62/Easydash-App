import express from "express";
import path from "path";
import crypto from "crypto";
import webpush from "web-push";
import fs from "fs";
// Disable SSL verification ONLY when explicitly requested via env var.
// Never set this unconditionally in production — it disables MITM protection.
if (process.env.ALLOW_INSECURE_TLS === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('[SECURITY] TLS certificate verification is DISABLED (ALLOW_INSECURE_TLS=true). Only use this for self-signed Jeedom certs on a trusted network.');
}
// --- SSRF protection ---
// Block cloud metadata endpoints and other dangerous internal targets.
// The app intentionally allows local-network IPs (192.168.x, 10.x, *.local)
// because Jeedom typically runs on the home LAN.
const BLOCKED_HOSTS = new Set([
    '169.254.169.254', // AWS / GCP / Azure instance metadata
    '100.100.100.200', // Alibaba Cloud metadata
    'fd00::ec2', // AWS IPv6 metadata
    '::1', // IPv6 localhost
]);
const isSafeUrl = (urlStr) => {
    try {
        const { protocol, hostname } = new URL(urlStr);
        if (!['http:', 'https:'].includes(protocol))
            return false;
        if (BLOCKED_HOSTS.has(hostname))
            return false;
        return true;
    }
    catch {
        return false;
    }
};
// ─── Push security helpers ────────────────────────────────────────────────────
// Token generated at startup — any client that can reach the server can fetch it
// via GET /api/push/token. It protects against blind external requests (scanners,
// cross-origin CSRF) but is not a substitute for network-level access control.
const PUSH_SERVER_TOKEN = process.env.PUSH_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.PUSH_SECRET) {
    console.info('[push] No PUSH_SECRET env var set — generated ephemeral token (resets on restart).');
}
// Simple in-memory rate limiter (no extra dependency)
const _rateBuckets = new Map();
function checkRateLimit(key, maxPerWindow, windowMs) {
    const now = Date.now();
    const bucket = _rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
        _rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (bucket.count >= maxPerWindow)
        return false;
    bucket.count++;
    return true;
}
// CSRF / origin guard — reject requests whose Origin header doesn't match the server host.
// Browsers always send Origin on cross-site requests; same-origin requests either omit it
// or send the correct value. Direct CLI tools (curl) have no Origin — allowed but rate-limited.
function isAllowedOrigin(req) {
    const origin = req.headers['origin'];
    if (!origin)
        return true; // direct / curl — rely on rate limiting
    const host = req.headers['host'] || '';
    const allowed = new Set([
        `http://${host}`,
        `https://${host}`,
        ...(process.env.PUSH_ALLOWED_ORIGIN ? [process.env.PUSH_ALLOWED_ORIGIN] : []),
    ]);
    return allowed.has(origin);
}
// Bearer token check
function hasPushToken(req) {
    const auth = req.headers['authorization'];
    return auth === `Bearer ${PUSH_SERVER_TOKEN}`;
}
// Max subscriptions to prevent memory DOS
const MAX_SUBSCRIPTIONS = 50;
// ─── Web Push ─────────────────────────────────────────────────────────────────
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@easydash.local';
let pushEnabled = false;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    pushEnabled = true;
    console.log('[push] Web Push enabled');
}
else {
    console.warn('[push] VAPID keys not set — Web Push disabled. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars to enable.');
}
// Subscriptions store: in-memory + optional JSON persistence
const SUBS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json');
const subscriptions = new Map();
function loadSubscriptions() {
    try {
        if (fs.existsSync(SUBS_FILE)) {
            const data = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
            data.forEach(d => subscriptions.set(d.id, d));
            console.log(`[push] Loaded ${subscriptions.size} subscriptions`);
        }
    }
    catch { /* ignore */ }
}
function saveSubscriptions() {
    try {
        fs.mkdirSync(path.dirname(SUBS_FILE), { recursive: true });
        fs.writeFileSync(SUBS_FILE, JSON.stringify([...subscriptions.values()], null, 2));
    }
    catch { /* ignore */ }
}
loadSubscriptions();
async function broadcastPush(payload) {
    if (!pushEnabled || subscriptions.size === 0)
        return;
    const dead = [];
    await Promise.allSettled([...subscriptions.values()].map(async (device) => {
        try {
            await webpush.sendNotification(device.subscription, JSON.stringify(payload));
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                // Subscription expired or unregistered
                dead.push(device.id);
            }
        }
    }));
    if (dead.length > 0) {
        dead.forEach(id => subscriptions.delete(id));
        saveSubscriptions();
    }
}
async function startServer() {
    try {
        const app = express();
        const PORT = Number(process.env.PORT) || 3000;
        const NODE_ENV = process.env.NODE_ENV || 'development';
        console.log(`Starting server in ${NODE_ENV} mode...`);
        // Add security headers to allow OAuth popups
        app.use((_req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
            next();
        });
        // Health check endpoint
        app.get("/health", (_req, res) => {
            res.status(200).send("OK");
        });
        app.use(express.json({ limit: '512kb' }));
        // Proxy HTTP → Jeedom (résout les problèmes CORS pour les accès externes)
        app.post("/api/proxy", async (req, res) => {
            const { url, method = 'POST', body } = req.body || {};
            if (!url || typeof url !== 'string')
                return res.status(400).json({ error: 'Missing url' });
            // SSRF guard
            if (!isSafeUrl(url)) {
                console.warn(`[proxy] Blocked request to disallowed URL: ${url}`);
                return res.status(403).json({ error: 'URL not allowed' });
            }
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15_000);
            try {
                const fetchOptions = {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    signal: controller.signal,
                };
                if (method === 'POST' && body)
                    fetchOptions.body = JSON.stringify(body);
                const upstream = await fetch(url, fetchOptions);
                clearTimeout(timeout);
                const text = await upstream.text();
                res.status(upstream.status).send(text);
            }
            catch (e) {
                clearTimeout(timeout);
                if (e.name === 'AbortError')
                    return res.status(504).json({ error: 'Upstream timeout' });
                res.status(502).json({ error: e.message });
            }
        });
        // Camera proxy — fetches the camera image server-side so the API key
        // never appears in the browser DOM or disk cache.
        app.post("/api/camera", async (req, res) => {
            const { url } = req.body || {};
            if (!url || typeof url !== 'string')
                return res.status(400).json({ error: 'Missing url' });
            // SSRF guard (same rules as main proxy)
            if (!isSafeUrl(url)) {
                console.warn(`[camera] Blocked request to disallowed URL`);
                return res.status(403).json({ error: 'URL not allowed' });
            }
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000);
            try {
                const upstream = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);
                res.status(upstream.status);
                res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
                res.setHeader('Cache-Control', 'no-store, no-cache');
                const buffer = await upstream.arrayBuffer();
                res.send(Buffer.from(buffer));
            }
            catch (e) {
                clearTimeout(timeout);
                if (e.name === 'AbortError')
                    return res.status(504).json({ error: 'Camera timeout' });
                res.status(502).json({ error: e.message });
            }
        });
        // ── Push subscription endpoints ─────────────────────────────────────────
        // ads.txt — required by Google AdSense to authorize ad serving on this domain
        app.get("/ads.txt", (_req, res) => {
            const clientId = process.env.ADSENSE_CLIENT_ID || '';
            if (!clientId)
                return res.status(404).send('');
            res.type('text/plain').send(`google.com, ${clientId}, DIRECT, f08c47fec0942fa0\n`);
        });
        // Public endpoint — returns AdSense config from env vars (values are public by nature)
        app.get("/api/adsense-config", (_req, res) => {
            const clientId = process.env.ADSENSE_CLIENT_ID || '';
            const slotId = process.env.ADSENSE_SLOT_ID || '';
            if (!clientId || !slotId)
                return res.status(404).json({ error: 'AdSense not configured' });
            res.json({ clientId, slotId });
        });
        // Public endpoint — returns VAPID public key and a server token so the
        // frontend can authenticate subsequent write requests.
        app.get("/api/push/vapid-public-key", (_req, res) => {
            if (!pushEnabled)
                return res.status(503).json({ error: 'Push not configured' });
            res.json({ publicKey: VAPID_PUBLIC, token: PUSH_SERVER_TOKEN });
        });
        // Subscribe — rate-limited to 5 new subscriptions per IP per hour
        app.post("/api/push/subscribe", (req, res) => {
            if (!pushEnabled)
                return res.status(503).json({ error: 'Push not configured' });
            if (!isAllowedOrigin(req))
                return res.status(403).json({ error: 'Origin not allowed' });
            const ip = String(req.ip || '');
            if (!checkRateLimit(`sub:${ip}`, 5, 3_600_000)) {
                return res.status(429).json({ error: 'Too many subscription requests' });
            }
            if (subscriptions.size >= MAX_SUBSCRIPTIONS) {
                return res.status(429).json({ error: 'Subscription limit reached' });
            }
            const { subscription, deviceName } = req.body || {};
            if (!subscription?.endpoint || typeof subscription.endpoint !== 'string') {
                return res.status(400).json({ error: 'Missing or invalid subscription' });
            }
            if (subscription.endpoint.length > 500) {
                return res.status(400).json({ error: 'Subscription endpoint too long' });
            }
            const id = Buffer.from(subscription.endpoint).toString('base64').slice(0, 32);
            const device = {
                id,
                subscription: subscription,
                deviceName: String(deviceName || 'Unknown device').slice(0, 120),
                createdAt: Date.now(),
            };
            subscriptions.set(id, device);
            saveSubscriptions();
            console.log(`[push] Subscribed device: ${id}`);
            res.json({ id });
        });
        // Unsubscribe — requires token + origin check
        app.delete("/api/push/subscribe/:id", (req, res) => {
            if (!isAllowedOrigin(req))
                return res.status(403).json({ error: 'Origin not allowed' });
            if (!hasPushToken(req))
                return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            subscriptions.delete(id);
            saveSubscriptions();
            res.json({ ok: true });
        });
        // Device list — requires token
        app.get("/api/push/devices", (req, res) => {
            if (!hasPushToken(req))
                return res.status(401).json({ error: 'Unauthorized' });
            const list = [...subscriptions.values()].map(d => ({
                id: d.id,
                deviceName: d.deviceName,
                createdAt: d.createdAt,
            }));
            res.json(list);
        });
        // Broadcast — requires token + origin + rate limit (20/hour global)
        app.post("/api/push/broadcast", async (req, res) => {
            if (!pushEnabled)
                return res.status(503).json({ error: 'Push not configured' });
            if (!isAllowedOrigin(req))
                return res.status(403).json({ error: 'Origin not allowed' });
            if (!hasPushToken(req))
                return res.status(401).json({ error: 'Unauthorized' });
            if (!checkRateLimit('broadcast', 20, 3_600_000)) {
                return res.status(429).json({ error: 'Broadcast rate limit exceeded' });
            }
            const { title, body, severity } = req.body || {};
            if (!title || !body || typeof title !== 'string' || typeof body !== 'string') {
                return res.status(400).json({ error: 'Missing or invalid title/body' });
            }
            await broadcastPush({
                title: title.slice(0, 200),
                body: body.slice(0, 500),
                severity,
            });
            res.json({ ok: true, sent: subscriptions.size });
        });
        // Test notification — requires token + rate limit (5/hour per device)
        app.post("/api/push/test/:id", async (req, res) => {
            if (!pushEnabled)
                return res.status(503).json({ error: 'Push not configured' });
            if (!hasPushToken(req))
                return res.status(401).json({ error: 'Unauthorized' });
            const ip = String(req.ip || '');
            if (!checkRateLimit(`test:${ip}`, 5, 3_600_000)) {
                return res.status(429).json({ error: 'Too many test requests' });
            }
            const device = subscriptions.get(req.params.id);
            if (!device)
                return res.status(404).json({ error: 'Device not found' });
            try {
                await webpush.sendNotification(device.subscription, JSON.stringify({ title: 'EasyDash Test', body: 'Push notifications are working!', severity: 'info' }));
                res.json({ ok: true });
            }
            catch (e) {
                res.status(500).json({ error: e.message });
            }
        });
        // Vite middleware for development
        if (process.env.NODE_ENV !== "production") {
            const { createServer: createViteServer } = await import("vite");
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: "spa",
            });
            app.use(vite.middlewares);
        }
        else {
            // Serve static files from dist
            const distPath = path.join(process.cwd(), 'dist');
            if (process.env.NODE_ENV === 'production') {
                const fs = await import('fs');
                if (!fs.existsSync(distPath)) {
                    console.error(`CRITICAL: 'dist' folder not found at ${distPath}. Did the build fail?`);
                }
                else {
                    console.log(`Serving static files from ${distPath}`);
                }
            }
            app.use(express.static(distPath));
            // Handle SPA routing
            app.use((_req, res) => {
                res.sendFile(path.join(distPath, 'index.html'));
            });
        }
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}
startServer();

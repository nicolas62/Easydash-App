import express from "express";
import path from "path";


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
    'fd00::ec2',        // AWS IPv6 metadata
    '::1',              // IPv6 localhost
]);

const isSafeUrl = (urlStr: string): boolean => {
    try {
        const { protocol, hostname } = new URL(urlStr);
        if (!['http:', 'https:'].includes(protocol)) return false;
        if (BLOCKED_HOSTS.has(hostname)) return false;
        return true;
    } catch {
        return false;
    }
};

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

    app.use(express.json());

    // Proxy HTTP → Jeedom (résout les problèmes CORS pour les accès externes)
    app.post("/api/proxy", async (req: any, res: any) => {
      const { url, method = 'POST', body } = req.body || {};
      if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' });

      // SSRF guard
      if (!isSafeUrl(url)) {
          console.warn(`[proxy] Blocked request to disallowed URL: ${url}`);
          return res.status(403).json({ error: 'URL not allowed' });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      try {
        const fetchOptions: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          signal: controller.signal,
        };
        if (method === 'POST' && body) fetchOptions.body = JSON.stringify(body);
        const upstream = await fetch(url, fetchOptions);
        clearTimeout(timeout);
        const text = await upstream.text();
        res.status(upstream.status).send(text);
      } catch (e: any) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') return res.status(504).json({ error: 'Upstream timeout' });
        res.status(502).json({ error: e.message });
      }
    });

    // Camera proxy — fetches the camera image server-side so the API key
    // never appears in the browser DOM or disk cache.
    app.post("/api/camera", async (req: any, res: any) => {
        const { url } = req.body || {};
        if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' });

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
        } catch (e: any) {
            clearTimeout(timeout);
            if (e.name === 'AbortError') return res.status(504).json({ error: 'Camera timeout' });
            res.status(502).json({ error: e.message });
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
  } else {
    // Serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    if (process.env.NODE_ENV === 'production') {
      const fs = await import('fs');
      if (!fs.existsSync(distPath)) {
        console.error(`CRITICAL: 'dist' folder not found at ${distPath}. Did the build fail?`);
      } else {
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
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

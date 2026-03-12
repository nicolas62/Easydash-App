import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
    try {
        const app = express();
        const PORT = Number(process.env.PORT) || 3000;
        const NODE_ENV = process.env.NODE_ENV || 'development';
        console.log(`Starting server in ${NODE_ENV} mode...`);
        // Health check endpoint
        app.get("/health", (req, res) => {
            res.status(200).send("OK");
        });
        // --- API PROXY ENDPOINT ---
        app.get("/api/proxy", async (req, res) => {
            const targetUrl = req.query.url;
            if (!targetUrl) {
                return res.status(400).json({ error: "Missing 'url' query parameter" });
            }
            try {
                const response = await fetch(targetUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    return res.status(response.status).send(response.statusText);
                }
                const contentType = response.headers.get('content-type');
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
                const buffer = await response.arrayBuffer();
                res.send(Buffer.from(buffer));
            }
            catch (error) {
                console.error(`Proxy error for ${targetUrl}:`, error);
                res.status(500).json({ error: error.message });
            }
        });
        // --- JSON RPC POST PROXY ---
        app.use(express.json());
        app.post("/api/proxy", async (req, res) => {
            const targetUrl = req.query.url;
            if (!targetUrl) {
                return res.status(400).json({ error: "Missing 'url' query parameter" });
            }
            try {
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(req.body)
                });
                if (!response.ok) {
                    return res.status(response.status).send(response.statusText);
                }
                const data = await response.json();
                res.json(data);
            }
            catch (error) {
                console.error(`Proxy POST error for ${targetUrl}:`, error);
                res.status(500).json({ error: error.message });
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
            app.use((req, res) => {
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

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Disable SSL verification for self-signed certs (common in home automation)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000;
    const NODE_ENV = process.env.NODE_ENV || 'development';

    console.log(`Starting server in ${NODE_ENV} mode...`);

    // Add security headers to allow OAuth popups
    app.use((req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      next();
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).send("OK");
    });

    // Proxy HTTP → Jeedom (résout les problèmes CORS pour les accès externes)
    app.use(express.json());
    app.post("/api/proxy", async (req: any, res: any) => {
      const { url, method = 'POST', body } = req.body || {};
      if (!url) return res.status(400).json({ error: 'Missing url' });
      try {
        const fetchOptions: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        };
        if (method === 'POST' && body) fetchOptions.body = JSON.stringify(body);
        const upstream = await fetch(url, fetchOptions);
        const text = await upstream.text();
        res.status(upstream.status).send(text);
      } catch (e: any) {
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
    app.use((req, res) => {
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

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

    // --- PROXY REMOVED ---
    // The client now connects directly to Jeedom.
    // If you see 404 on /api/proxy, it means the client code is outdated.


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

import "dotenv/config"; // MUST be first — loads .env before any imported module reads process.env (e.g. SIGNED_URL_SECRET in _signed-url)
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createApiApp } from "./api/_app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server: ReturnType<typeof app.listen> | null = null;

async function startServer() {
  const app = createApiApp();
  const PORT = Number(process.env.PORT) || 4002;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`DROPKAST runtime online at http://localhost:${PORT}`);
  });
}

function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    // Force close after 10s
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

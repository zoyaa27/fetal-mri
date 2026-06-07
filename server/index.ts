import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { ragRouter } from "./routes/rag.js";

// Import your study engine router module cleanly at the top
import { studyRouter } from "./routes/study.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Read incoming JSON data maps naturally
  app.use(express.json());

  // Mount your custom feature API routes BEFORE serving static front-end assets
  app.use("/api/studies", studyRouter);
  app.use("/api/rag", ragRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    console.log(`[SUCCESS]: Server initialized on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
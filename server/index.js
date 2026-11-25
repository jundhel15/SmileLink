import { Buffer } from "node:buffer";
import express from "express";
import process from "node:process";
import { registerRoutes } from "./config/apiserver.js";

const app = express();
// No CORS: the site and the API share one origin (Vite proxies /api in dev), so other websites stay blocked
// Keeps the raw body so the PayMongo webhook signature can be checked against the exact bytes sent
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Logs each API request and its status, to debug saves from the browser
app.use("/api", (req, res, next) => {
  res.on("finish", () => {
    // a photo's body is raw bytes, not fields
    const fields = req.body && !Buffer.isBuffer(req.body) ? Object.keys(req.body).join(", ") : "";
    console.log(`[api] ${req.method} ${req.originalUrl} -> ${res.statusCode}${fields ? ` | fields: ${fields}` : ""}`);
  });
  next();
});

registerRoutes(app);

app.get("/", (req, res) => {
  ///api/health
  res.json({ ok: true, message: "Express is running" });
});

// Anything a route didn't handle. Details are only logged, never sent to the visitor.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: "The request couldn't be read." });
  }
  console.error(`[api] ${req.method} ${req.originalUrl}`, error.message);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

// On Vercel, api/index.js hands this app to a serverless function; locally it runs as a normal server
export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

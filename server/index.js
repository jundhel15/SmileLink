import express from "express";
import cors from "cors";
import process from "node:process";
import { registerRoutes } from "./config/apiserver.js";

const app = express();
app.use(cors());
app.use(express.json());

// Logs each API request and its status, to debug saves from the browser
app.use("/api", (req, res, next) => {
  res.on("finish", () => {
    const fields = req.body ? Object.keys(req.body).join(", ") : "";
    console.log(`[api] ${req.method} ${req.originalUrl} -> ${res.statusCode}${fields ? ` | fields: ${fields}` : ""}`);
  });
  next();
});

registerRoutes(app);

app.get("/", (req, res) => {
  ///api/health
  res.json({ ok: true, message: "Express is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

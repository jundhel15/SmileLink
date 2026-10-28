import express from "express";
import cors from "cors";
import process from "node:process";
import { registerRoutes } from "./apiservice.js";

const app = express();
app.use(cors());
app.use(express.json());

registerRoutes(app);

app.get("/", (req, res) => {
  ///api/health
  res.json({ ok: true, message: "Express is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

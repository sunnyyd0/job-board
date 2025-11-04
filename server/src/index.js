import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { startCron } from "./jobs/cron.js";
import jobRoutes from "./routes/jobRoutes.js";
import importLogRoutes from "./routes/importLogRoutes.js";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

await connectDB();

// start cron (will schedule inside same process)
startCron();

app.use("/api/jobs", jobRoutes);
app.use("/api/import-logs", importLogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

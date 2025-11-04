import express from "express";
import ImportLog from "../models/ImportLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching import logs:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

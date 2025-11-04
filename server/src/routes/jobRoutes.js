import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// GET /api/jobs
router.get("/", async (req, res) => {
  const { source, limit = 100, skip = 0 } = req.query;
  const filter = {};
  if (source) filter.source = source;
  try {
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10));
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

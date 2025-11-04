import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import pkg from "bullmq";
const { Worker } = pkg;
import IORedis from "ioredis";
import { connectDB } from "../config/db.js";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
});

await connectDB();
console.log("✅ MongoDB Connected");

const queueName = process.env.QUEUE_NAME || "job-import-queue";
console.log("👷 Listening on queue:", queueName);

const worker = new Worker(
  queueName,
  async (bullJob) => {
    console.log("🧠 Job received:", bullJob.id, "source:", bullJob.data.source);

    const jobData = {
      guid: bullJob.data.guid,
      title: bullJob.data.title,
      link: bullJob.data.link,
      description: bullJob.data.description,
      pubDate: bullJob.data.pubDate
        ? new Date(bullJob.data.pubDate)
        : new Date(),
      source: bullJob.data.source,
      raw: bullJob.data.raw || bullJob.data,
    };

    try {
      const existing = await Job.findOne({ guid: jobData.guid });

      const isNew = !existing;
      if (existing) {
        await Job.updateOne({ _id: existing._id }, jobData);
        console.log("📝 Updated job:", jobData.guid);
      } else {
        await Job.create(jobData);
        console.log("✨ Created job:", jobData.guid);
      }

      // update the ImportLog counters in one $inc
      if (bullJob.data.logId) {
        await ImportLog.findByIdAndUpdate(bullJob.data.logId, {
          $inc: {
            totalImported: 1,
            ...(isNew ? { newJobs: 1 } : { updatedJobs: 1 }),
          },
        }).exec();
      }

      return { status: "success" };
    } catch (err) {
      console.error("❌ Error processing job:", err.message);
      if (bullJob.data.logId) {
        await ImportLog.findByIdAndUpdate(bullJob.data.logId, {
          $push: { failedJobs: { guid: jobData.guid, reason: err.message } },
        }).exec();
      }
      throw err;
    }
  },
  { connection, concurrency: parseInt(process.env.CONCURRENCY || "5", 10) }
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} done`));
worker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed: ${err?.message}`)
);


import bullmq from "bullmq"; 
import IORedis from "ioredis";

const { Queue } = bullmq;

//  Some builds moved QueueScheduler into its own subpath
let QueueScheduler;
try {

  QueueScheduler = (await import("bullmq/dist/classes/queue-scheduler.js"))
    .QueueScheduler;
} catch {
  QueueScheduler = bullmq.QueueScheduler; // fallback if older
}

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
});

const queueName = process.env.QUEUE_NAME || "job-import-queue";

export const jobQueue = new Queue(queueName, { connection });

//  Create and initialize scheduler safely
if (QueueScheduler) {
  new QueueScheduler(queueName, { connection });
  console.log("✅ QueueScheduler initialized for:", queueName);
} else {
  console.warn("⚠️ QueueScheduler not found in current bullmq version!");
}

console.log("✅ Redis Queue initialized:", queueName);

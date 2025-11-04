import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import cron from "node-cron";
import { jobQueue } from "./queue.js";
import { fetchJobsFromFeed } from "../services/jobService.js";
import ImportLog from "../models/ImportLog.js";

const sources = (process.env.JOB_SOURCES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const startCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    // change pattern to "0 * * * *" for hourly
    console.log("⏰ Cron: Fetching jobs...");

    for (const url of sources) {
      try {
        const jobs = await fetchJobsFromFeed(url);
        console.log(`📦 ${url} → ${jobs.length} jobs`);
        // jobs.push({
        //   guid: "fake-" + Date.now(),
        //   title: "Test New Job " + new Date().toISOString(),
        //   link: "https://example.com/job/" + Date.now(),
        //   description: "Simulated new job for testing import logs",
        //   pubDate: new Date(),
        //   source: url,
        // });

        // create a log doc for this feed-run
        const log = await ImportLog.create({
          source: url,
          timestamp: new Date(),
          totalFetched: jobs.length,
        });

        for (const j of jobs) {
          const payload = {
            guid: j.guid?._ || j.guid || j.link,
            title: j.title,
            link: j.link,
            description: j.description || j["content:encoded"] || "",
            pubDate: j.pubDate ? new Date(j.pubDate) : new Date(),
            source: url,
            logId: log._id,
          };

          console.log("🌀 Adding job to queue:", payload.guid);
          await jobQueue.add("import", payload, { attempts: 3 });
        }

        console.log("✅ Cron: All jobs queued for", url);
      } catch (err) {
        console.error(`❌ Cron error for ${url}:`, err.message);
      }
    }

    console.log("✅ Cron cycle complete\n");
  });

  console.log("🕒 Cron scheduled every minute (*/1 * * * *)");
};

if (process.argv[1] && process.argv[1].endsWith("cron.js")) {
  startCron();
}

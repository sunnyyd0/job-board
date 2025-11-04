import mongoose from "mongoose";

const FailedJobSchema = new mongoose.Schema(
  {
    guid: String,
    reason: String,
  },
  { _id: false }
);

const ImportLogSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: [FailedJobSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ImportLog ||
  mongoose.model("ImportLog", ImportLogSchema);

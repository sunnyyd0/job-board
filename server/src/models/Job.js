import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    guid: { type: String, required: true, index: true, unique: false },
    title: String,
    link: String,
    description: String,
    pubDate: Date,
    source: String,
    raw: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);

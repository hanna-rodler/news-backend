import mongoose from "mongoose";
const crawlerDB = mongoose.connection.useDb("news-battery");

const crawlerQueueSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  href: { type: String, required: true },
  headline: { type: String, required: true },
  subtarget: { type: String, required: false },
  versions: {
    originalShort: { type: Boolean, default: false },
    originalShortest: { type: Boolean, default: false },
    softer: { type: Boolean, default: false },
    softerShort: { type: Boolean, default: false },
    softerShortest: { type: Boolean, default: false },
    verySoft: { type: Boolean, default: false },
    verySoftShort: { type: Boolean, default: false },
    verySoftShortest: { type: Boolean, default: false },
    softerNums: { type: Boolean, default: false },
    softerShortNums: { type: Boolean, default: false }, // TODO
    softerShortestNums: { type: Boolean, default: false }, // TODO
    verySoftNums: { type: Boolean, default: false },
    verySoftShortNums: { type: Boolean, default: false }, // TODO
    verySoftShortestNums: { type: Boolean, default: false }, // TODO
  },
  isWaitingForCategoryEvaluation: {
    type: Boolean,
    default: false,
  },
});

export const CrawlerQueue = crawlerDB.model("queue", crawlerQueueSchema);

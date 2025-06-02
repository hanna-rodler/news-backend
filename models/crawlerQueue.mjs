import mongoose from "mongoose";
const crawlerDB = mongoose.connection.useDb("crawler");

const crawlerQueueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  href: { type: String, required: true },
  headline: { type: String, required: true },
  subtarget: { type: String, required: true },
  _id: { type: String, required: false },
  versions: {
    originalShort: { type: Boolean, default: false },
    originalShortest: { type: Boolean, default: false },
    softer: { type: Boolean, default: false },
    softerShort: { type: Boolean, default: false },
    softerShortest: { type: Boolean, default: false },
    verySoft: { type: Boolean, default: false },
    verySoftShort: { type: Boolean, default: false },
    verySoftShortest: { type: Boolean, default: false },
  },
  isSofterValid: { type: Boolean, default: false },
});

export const CrawlerQueue = crawlerDB.model("queue", crawlerQueueSchema);

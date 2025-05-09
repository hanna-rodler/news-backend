import mongoose from "mongoose";
const crawlerDB = mongoose.connection.useDb("crawler");

const crawlerQueueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  href: { type: String, required: true },
  headline: { type: String, required: true },
  subtarget: { type: String, required: true },
  _id: { type: String, required: false },
});

export const CrawlerQueue = crawlerDB.model("queue", crawlerQueueSchema);

import mongoose from "mongoose";
const crawlerDB = mongoose.connection.useDb("crawler");

const crawledArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lead: { type: String, required: false },
  content: { type: String, required: true },
  version: { type: String, required: true },
  href: { type: String, required: true },
  figures: { type: [String], required: false },
  date: { type: Date, required: false },
  category: { type: String, required: true },
  footer: { type: String, required: false },
  id: { type: String, required: true },
  _id: { type: String, required: false },
});

export const CrawledArticle = crawlerDB.model("Article", crawledArticleSchema);

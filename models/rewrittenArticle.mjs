import mongoose from "mongoose";
const crawlerDB = mongoose.connection.useDb("news-battery");

const rewrittenArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lead: { type: String, required: false },
  content: { type: String, required: true },
  version: { type: String, required: true },
  href: { type: String, required: true },
  figures: { type: [String], required: false },
  date: { type: Date, required: false },
  category: { type: String, required: true },
  footer: { type: String, required: false },
  id: { type: Number, required: true },
});

export const RewrittenArticle = crawlerDB.model(
  "Article",
  rewrittenArticleSchema
);

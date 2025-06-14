import mongoose from "mongoose";
const noNumRewriteDB = mongoose.connection.useDb("news-battery");

const noNumRewriteSchema = new mongoose.Schema({
  id: { type: Number, required: true },
});

export const NoNumRewriter = noNumRewriteDB.model(
  "no_num_rewriter",
  noNumRewriteSchema
);

import express from "express";
import dotenv from "dotenv";
import {
  summarizeOriginalArticlesController,
  rewriteMultipleArticlesController,
  rewriteOneArticleController,
  cleanupQueueController,
  summarizeOneOriginalArticleController,
} from "../controllers/rewriter.controllers.mjs";
dotenv.config();

const router = express.Router();

// versions: verySoft, softer
router.post("/original/:id", summarizeOneOriginalArticleController); // TODO: just one
router.post("/:version/all", rewriteMultipleArticlesController);
router.post("/:version/:id", rewriteOneArticleController);
router.post("/original/all", summarizeOriginalArticlesController);
router.post("/cleanup-queue", cleanupQueueController);
// TODO: only delete if other versions (softer, verySoft) are also rewritten
// await CrawlerQueue.deleteOne({ _id: articleId._id });

export default router;

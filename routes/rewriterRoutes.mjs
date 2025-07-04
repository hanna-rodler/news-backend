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

router.post("/original/all", summarizeOriginalArticlesController);
router.post("/original/:id", summarizeOneOriginalArticleController);
// versions: verySoft, softer
router.post("/:version/all", rewriteMultipleArticlesController);
router.post("/:version/:id", rewriteOneArticleController);
router.post("/cleanup-queue", cleanupQueueController);

export default router;

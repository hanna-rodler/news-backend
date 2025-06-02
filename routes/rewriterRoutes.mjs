import express from "express";
import dotenv from "dotenv";
import {
  softerRewriterController,
  verySoftRewriterController,
  rewriteVerySoftArticlesController,
  summarizeOriginalArticlesController,
  rewriteSofterArticlesController,
  rewriteController,
  rewriteSingleController,
} from "../controllers/rewriter.controllers.mjs";
dotenv.config();

const router = express.Router();

router.post("/original/all", summarizeOriginalArticlesController);
router.post("/softer/all", rewriteSofterArticlesController);
router.post("/very-soft/all", rewriteVerySoftArticlesController);
router.post("/very-soft/:id", verySoftRewriterController);
router.post("/all/:version", rewriteController);
router.post("/:version/:id", rewriteSingleController);
// router.post("/summarize/:id", verySoftRewriterController); // TODO
// router.get("/cleanup", summaryRewriterController); // TODO: only delete if other versions (softer, verySoft) are also rewritten
// await CrawlerQueue.deleteOne({ _id: articleId._id });

export default router;

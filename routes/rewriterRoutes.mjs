import express from "express";
import dotenv from "dotenv";
import {
  softerRewriterController,
  verySoftRewriterController,
  summaryRewriterController,
} from "../controllers/rewriter.controllers.mjs";
dotenv.config();

const router = express.Router();

router.post("/softer/:id", softerRewriterController);
router.post("/verySoft/:id", verySoftRewriterController);
router.get("/summarize", summaryRewriterController);

export default router;

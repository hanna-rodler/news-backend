import express from "express";
import dotenv from "dotenv";
import {
  crawlDetailsController,
  crawlOverviewController,
} from "../controllers/crawler.controllers.mjs";
dotenv.config();

const router = express.Router();

router.get("/overview", crawlOverviewController);
router.get("/details", crawlDetailsController);

export default router;

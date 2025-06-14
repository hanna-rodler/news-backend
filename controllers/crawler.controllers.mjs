let puppeteer, chromium;
import dotenv from "dotenv";
import { crawlDetails, crawlOverview } from "../services/crawler.services.mjs";
if (process.env.APP_ENV === "prod") {
  console.log("Running in prod mode!");
  puppeteer = (await import("puppeteer-core")).default;
  chromium = (await import("@sparticuz/chromium")).default;
} else {
  console.log("Running in local development mode with full puppeteer");
  puppeteer = (await import("puppeteer")).default;
}

dotenv.config();

export const crawlOverviewController = async (req, res) => {
  try {
    const overview = await crawlOverview();
    if (overview.length > 0) {
      res.status(200).json({ overview });
    } else {
      res.status(404).json({ message: "No articles found" });
    }
    res.json({ overview });
  } catch (error) {
    return {
      message: "Overview crawl failed",
      error: error.message,
    };
  }
};

// TODO: make sure that an error never occurs.
export const crawlDetailsController = async (req, res) => {
  try {
    const result = await crawlDetails();
    if (result.shouldSaveCount !== result.articleDetails.length) {
      throw new Error(
        "Details not saved, count mismatch. Expected: " +
          result.shouldSaveCount +
          ", but got: " +
          result.articleDetails.length +
          ". Skipped: " +
          result.skippedArticles
      );
    }
    res.send({
      status: "200",
      message: "Article details crawled successfully",
      shouldSave: result.shouldSaveCount,
      skipped: result.skippedArticles,
      saved: result.articleDetails.length,
    });
  } catch (error) {
    console.error("Error during scraping:", error);
    return {
      status: "500",
      message: "Failed to scrape articles in scrapeArticles()",
      error: error.message,
    };
  }
};

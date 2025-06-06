import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import { checkVersionName } from "../utils/utils.mjs";
import { rewriteSoftened, summarize } from "../services/rewriter.services.mjs";
import { checkValidity } from "../utils/rewrite.mjs";
import { RewrittenArticle } from "../models/rewrittenArticle.mjs";

// TODO: make route just for one article in case one got missed.

export const rewriteOneArticleController = async (req, res) => {
  try {
    const articleId = req.params.id;
    const version = req.params.version;
    if (checkVersionName(version)) {
      try {
        const result = await rewriteArticle(articleId, version);
        const {
          isFullyRewritten,
          softenedArticle,
          summarizedShort,
          summarizedShortest,
        } = result;
        if (
          isFullyRewritten &&
          checkValidity(softenedArticle) &&
          checkValidity(summarizedShort) &&
          checkValidity(summarizedShortest)
        ) {
          return res
            .status(200)
            .json({ softenedArticle, summarizedShort, summarizedShortest });
        } else {
          return res.status(404).json({
            message: "Rewriting error has occured",
            isFullyRewritten,
            softenedArticle,
            summarizedShort,
            summarizedShortest,
          });
        }
      } catch (error) {
        return res.status(500).json({
          message: `Rewrite for version ${version} failed`,
          error: error.message,
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid version name",
        validVersions: ["softer", "verySoft"],
      });
    }
  } catch (error) {
    return {
      message: "Overview crawl failed",
      error: error.message,
    };
  }
};

export const summarizeOriginalArticlesController = async (req, res) => {
  try {
    const articles = await CrawlerQueue.find().limit(50);
    const successfullyRewritten = [];
    for (const article of articles) {
      console.log("Summarizing article", article.title, "with id", article.id);

      // short
      const originalShort = await summarize(article.id, "originalShort");

      // shortest
      const originalShortest = await summarize(article.id, "originalShortest");
      if (checkValidity(originalShort) || checkValidity(originalShortest)) {
        successfullyRewritten.push(article.id);
        console.log(
          "Successfully summarized article",
          article.title,
          "with id",
          article.id
        );
      }
    }
    res.status(200).json({
      message: "Rewrote articles",
      articles: successfullyRewritten,
    });
  } catch (error) {
    return {
      message: "Rewrite failed",
      error: error.message,
    };
  }
};

export const summarizeOneOriginalArticleController = async (req, res) => {
  try {
    console.log("Summarizing one original article");
    const articleId = req.params.id;
    const article = await RewrittenArticle.findOne({
      _id: articleId + "-original",
    });
    console.log("article", article);
    if (article) {
      console.log("Summarizing article", article.title, "with id", article.id);
      // short
      const originalShort = await summarize(article.id, "originalShort");

      // shortest
      const originalShortest = await summarize(article.id, "originalShortest");
      if (checkValidity(originalShort) || checkValidity(originalShortest)) {
        res.status(200).json({
          message: "Summarized articles",
        });
      } else {
        res.status(404).json({
          message: "Couldn't generate valid summaries for the article",
          article: articleId,
        });
      }
    } else {
      res.status(404).json({
        message: "Article not found",
        article: articleId,
      });
    }
  } catch (error) {
    return {
      message: "Rewrite failed",
      error: error.message,
    };
  }
};

export const rewriteMultipleArticlesController = async (req, res) => {
  try {
    const version = req.params.version;
    if (checkVersionName(version)) {
      try {
        const articles = await CrawlerQueue.find().limit(50);
        const successfullyRewritten = [];
        for (const article of articles) {
          const result = await rewriteArticle(article.id, version);
          const {
            isFullyRewritten,
            softenedArticle,
            summarizedShort,
            summarizedShortest,
          } = result;

          if (
            isFullyRewritten &&
            checkValidity(softenedArticle) &&
            checkValidity(summarizedShort) &&
            checkValidity(summarizedShortest)
          ) {
            successfullyRewritten.push(article.id);
          } else {
            console.log(
              `Article ${article.id} could not be fully rewritten with version ${version}`
            );
          }
        }
        res.status(200).json({
          message: "Rewrote articles",
          articles: successfullyRewritten,
        });
      } catch (error) {
        return {
          message: `Rewrite for version ${version} failed`,
          error: error.message,
        };
      }
    } else {
      return res.status(400).json({
        message: "Invalid version name",
        validVersions: ["softer", "verySoft"],
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error in rewriteController",
      error: error.message,
    });
  }
};

async function rewriteArticle(articleId, version) {
  try {
    console.log("article:", articleId, " version:", version);
    let softenedArticle = await rewriteSoftened(articleId, version);
    if (checkValidity(softenedArticle)) {
      const summarizedShort = await summarize(
        articleId,
        version + "Short",
        softenedArticle
      );
      const summarizedShortest = await summarize(
        articleId,
        version + "Shortest",
        softenedArticle
      );
      return {
        softenedArticle,
        summarizedShort,
        summarizedShortest,
        isFullyRewritten: true,
      };
    } else {
      return { message: "No valid article found", isFullyRewritten: false };
    }
  } catch (error) {
    return res.status(500).json({
      message: `Rewrite for version ${version} failed`,
      error: error.message,
    });
  }
}

export const cleanupQueueController = async (req, res) => {
  try {
    const articles = await CrawlerQueue.find().limit();
    const InvalidArticles = [];
    for (const article of articles) {
      const articleId = article._id;
      const versions = article.versions;
      console.log("Cleaning up article with id:", articleId, versions);
      // check if all versions are valid
      const allVersionsValid =
        versions.originalShort &&
        versions.originalShortest &&
        versions.softer &&
        versions.softerShort &&
        versions.softerShortest &&
        versions.verySoft &&
        versions.verySoftShort &&
        versions.verySoftShortest;

      // Delete the article from the queue
      if (allVersionsValid) {
        await CrawlerQueue.deleteOne({ _id: articleId });
        console.log("Deleted article with id:", articleId);
      } else {
        InvalidArticles.push(articleId);
        console.log(
          "Article with id:",
          articleId,
          "is not fully rewritten, skipping deletion."
        );
      }
    }
    res.status(200).send({
      message: "Cleanup completed",
      invalidArticles: InvalidArticles,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error during cleanup",
      error: error.message,
    });
  }
};

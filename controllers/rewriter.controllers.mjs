import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import { checkVersionName } from "../utils/utils.mjs";
import {
  rewriteVerySoft,
  rewriteSofter,
  summarize,
} from "../services/rewriter.services.mjs";
import { checkValidity } from "../utils/rewrite.mjs";

// TODO: make route just for one article in case one got missed.

export const rewriteSingleController = async (req, res) => {
  try {
    const articleId = req.params.id;
    const version = req.params.version;
    if (checkVersionName(version)) {
      try {
        console.log("article:", articleId, " version:", version);
        let softenedArticle = null;
        if (version === "verySoft") {
          softenedArticle = await rewriteVerySoft(articleId);
        } else {
          softenedArticle = await rewriteSofter(articleId);
        }
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
          if (
            checkValidity(summarizedShort) &&
            checkValidity(summarizedShortest)
          ) {
            return res
              .status(200)
              .json({ softenedArticle, summarizedShort, summarizedShortest });
          } else {
            return res
              .status(404)
              .json({ message: "No valid summaries found" });
          }
        } else {
          return res.status(404).json({ message: "No valid article found" });
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
        validVersions: [
          "softer",
          "softerShort",
          "softerShortest",
          "verySoft",
          "verySoftShort",
          "verySoftShortest",
          "original",
          "originalShort",
          "originalShortest",
        ],
      });
    }
  } catch (error) {
    return {
      message: "Overview crawl failed",
      error: error.message,
    };
  }
};

export const verySoftRewriterController = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await rewriteVerySoft(articleId);
    const summarizedShort = await summarize(
      articleId,
      "verySoftShort",
      article
    );
    const summarizedShortest = await summarize(
      articleId,
      "verySoftShortest",
      article
    );
    if (
      checkValidity(article) &&
      checkValidity(summarizedShort) &&
      checkValidity(summarizedShortest)
    ) {
      res.status(200).json({ article, summarizedShort, summarizedShortest });
    } else {
      res.status(404).json({ message: "No articles found" });
    }
  } catch (error) {
    return {
      message: "Overview crawl failed",
      error: error.message,
    };
  }
};

export const softerRewriterController = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await rewriteSofter(articleId);
    if (article.title.length > 5 && article.content.length > 10) {
      res.status(200).json({ article });
    } else {
      res.status(404).json({ message: "No articles found" });
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
    const articleIds = await CrawlerQueue.find().limit(50);
    const successfullyRewritten = [];
    for (const articleId of articleIds) {
      const valid = {
        originalShort: false,
        originalShortest: false,
      };
      console.log(
        "Rewriting article",
        articleId.title,
        "with id",
        articleId.id
      );

      // short
      const originalShort = await summarize(articleId.id, "originalShort");
      valid.originalShort = checkValidity(originalShort);

      // shortest
      const originalShortest = await summarize(
        articleId.id,
        "originalShortest"
      );
      valid.originalShortest = checkValidity(originalShortest);
      if (valid.originalShort || valid.originalShortest) {
        successfullyRewritten.push(articleId.id);
        console.log(
          "Successfully rewrote article",
          articleId.title,
          "with id",
          articleId.id
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

export const rewriteController = async (req, res) => {
  try {
    const version = req.params.version;
    if (checkVersionName(version)) {
      try {
        const articleIds = await CrawlerQueue.find().limit(50);
        const successfullyRewritten = [];
        for (const articleId of articleIds) {
          let softenedArticle = null;
          if (version === "verySoft") {
            softenedArticle = await rewriteVerySoft(articleId.id);
          } else if (version === "softer") {
            softenedArticle = await rewriteSofter(articleId.id);
          }
          if (checkValidity(verySoftArticle)) {
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

            if (
              checkValidity(summarizedShort) &&
              checkValidity(summarizedShortest)
            ) {
              successfullyRewritten.push(articleId.id);
            }
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
        validVersions: [
          "softer",
          "softerShort",
          "softerShortest",
          "verySoft",
          "verySoftShort",
          "verySoftShortest",
          "original",
          "originalShort",
          "originalShortest",
        ],
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error in rewriteController",
      error: error.message,
    });
  }
};

export const rewriteVerySoftArticlesController = async (req, res) => {
  try {
    const articleIds = await CrawlerQueue.find().limit(50);
    const successfullyRewritten = [];
    for (const articleId of articleIds) {
      const verySoftArticle = await rewriteVerySoft(articleId.id);

      if (checkValidity(verySoftArticle)) {
        const summarizedShort = await summarize(
          articleId,
          "verySoftShort",
          verySoftArticle
        );

        const summarizedShortest = await summarize(
          articleId,
          "verySoftShortest",
          verySoftArticle
        );
        if (
          checkValidity(summarizedShort) &&
          checkValidity(summarizedShortest)
        ) {
          successfullyRewritten.push(articleId.id);
          console.log(
            "Successfully rewrote article",
            articleId.title,
            "with id",
            articleId.id
          );
        }
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

export const rewriteSofterArticlesController = async (req, res) => {
  try {
    const articleIds = await CrawlerQueue.find().limit(50);
    const successfullyRewritten = [];
    for (const articleId of articleIds) {
      const softerArticle = await rewriteSofter(articleId.id);
      if (checkValidity(softerArticle)) {
        const summarizedShort = await summarize(
          articleId,
          "softerShort",
          softerArticle
        );

        const summarizedShortest = await summarize(
          articleId,
          "softerShortest",
          softerArticle
        );
        if (
          checkValidity(summarizedShort) &&
          checkValidity(summarizedShortest)
        ) {
          successfullyRewritten.push(articleId.id);
          // update CrawlerQueue with the validities
          await CrawlerQueue.updateOne(
            { _id: articleId._id },
            {
              $set: {
                "versions.softer": true,
                "versions.softerShort": summarizedShort,
                "versions.softerShortest": summarizedShortest,
              },
            }
          );
          console.log(
            "Successfully rewrote article",
            articleId.title,
            "with id",
            articleId.id
          );
        }
      }
    }
    // delete all articles from queue that were successfully rewritten
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

import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import {
  rewriteVerySoft,
  rewriteSofter,
  summarize,
} from "../services/rewriter.services.mjs";

// TODO: make route just for one article in case one got missed.

export const verySoftRewriterController = async (req, res) => {
  try {
    const article = await rewriteVerySoft(req.params.id);
    const summarizedShort = await summarize(
      req.params.id,
      "verySoftShort",
      article
    );
    const summarizedShortest = await summarize(
      req.params.id,
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
    const article = await rewriteSofter(req.params.id);
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
          await CrawlerQueue.deleteOne({ _id: articleId._id });
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
          await CrawlerQueue.deleteOne({ _id: articleId._id });
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

function checkValidity(article) {
  return (
    article !== null &&
    article.title.length > 3 &&
    article.content.length > 10 &&
    article.id !== undefined
  );
}

// export const summaryRewriterController = async (req, res) => {
//   try {
//     const overview = await summarize();
//     if (overview.length > 0) {
//       res.status(200).json({ overview });
//     } else {
//       res.status(404).json({ message: "No articles found" });
//     }
//   } catch (error) {
//     return {
//       message: "Overview crawl failed",
//       error: error.message,
//     };
//   }
// };

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
      const valid = {
        verySoft: false,
        verySoftShort: false,
        verySoftShortest: false,
      };
      const verySoftArticle = await rewriteVerySoft(articleId.id);
      valid.verySoft = checkValidity(verySoftArticle);
      // TODO: rewrite shorter
      valid.verySoftShort = true; // Placeholder for actual implementation. use verySoftArticle
      valid.verySoftShortest = true; // Placeholder for actual implementation
      if (valid.verySoft && valid.verySoftShort && valid.verySoftShortest) {
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
      const valid = {
        softer: false,
        softerShort: false,
        softerShortest: false,
      };
      const softerArticle = await rewriteSofter(articleId.id);
      valid.softer = checkValidity(softerArticle);
      // TODO: shorter, very short
      valid.softerShort = true; // Placeholder for actual implementation
      valid.softerShortest = true; // Placeholder for actual implementation
      if (valid.softerShort && valid.softerShortest && valid.softer) {
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

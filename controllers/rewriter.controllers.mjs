import {
  rewriteVerySoft,
  rewriteSofter,
} from "../services/rewriter.services.mjs";

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

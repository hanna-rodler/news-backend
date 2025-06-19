import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import dotenv from "dotenv";
import {
  getPrompt,
  getSummarizationPrompt,
  checkValidity,
} from "../utils/rewrite.mjs";
import { RewrittenArticle } from "../models/rewrittenArticle.mjs";
import { checkVersionName } from "../utils/utils.mjs";
import { NoNumRewriter } from "../models/noNumRewrites.mjs";
dotenv.config();
const apiKey = process.env.MISTRAL_API_KEY;

export const rewriteSoftened = async (
  articleId,
  version,
  originalArticle,
  client,
  isRewriteNums = false
) => {
  try {
    const existingArticle = await RewrittenArticle.findOne({
      id: articleId,
      version: version,
    });
    if (!existingArticle) {
      if (isRewriteNums) {
        const shouldNotRewriteNum = await NoNumRewriter.findOne({
          id: articleId,
        });
        if (shouldNotRewriteNum) {
          return {
            hasCasualityNumbers: false,
          };
        }
      }
      console.log(
        "rewriting article",
        originalArticle.title,
        " with version " + version
      );

      const userPrompt = getPrompt(version, originalArticle);
      // console.log("User Prompt", userPrompt);
      let rewrittenArticle = await rewriteArticleMistral(userPrompt, client);
      console.log(
        "rewritten: title",
        rewrittenArticle.title,
        " success: ",
        rewrittenArticle.success,
        " hasCasualityNumbers: ",
        rewrittenArticle.hasCasualityNumbers
      );
      if (rewrittenArticle.hasCasualityNumbers === false) {
        const noNumRewrite = new NoNumRewriter({ id: articleId });
        noNumRewrite.save();
        return {
          hasCasualityNumbers: rewrittenArticle.hasCasualityNumbers,
        };
        // } else if (!rewrittenArticle.success === false) {
      } else {
        const savedArticle = saveArticle(
          originalArticle,
          rewrittenArticle,
          version
        );
        if (checkValidity(savedArticle)) {
          await updateVersionValidities(articleId, version, true);
        }

        return savedArticle;
        // } else {
        //   return rewrittenArticle;
      }
    } else {
      console.log(
        `Article with version ${version} already exists in the database`,
        existingArticle.title
      );
      return existingArticle;
    }
  } catch (error) {
    console.error("Error during rewriting:", error);
    return {
      success: false,
      message: "Failed to rewrite very soft article",
      error: error.message,
    };
  }
};

export const summarize = async (articleId, version, client, article = null) => {
  try {
    if (checkVersionName(version) === false) {
      throw new Error("Invalid version provided for summarization");
    }

    const existingArticle = await RewrittenArticle.findOne({
      id: articleId,
      version: version,
    });
    if (!existingArticle) {
      if (!article) {
        let baseVersion = "original";
        if (version.includes("softer")) {
          baseVersion = "softer";
        } else if (version.includes("verySoft")) {
          baseVersion = "verySoft";
        }
        console.log("getting base version ", baseVersion);
        article = await RewrittenArticle.findOne({
          id: articleId,
          version: baseVersion,
        });
      }
      console.log("summarizing article", article.title, version);

      const isShortest = version.toLowerCase().includes("shortest")
        ? true
        : false;

      console.log("isShortest", isShortest);
      const summarizationPrompt = getSummarizationPrompt(article, isShortest);

      let summarizedArticle = await rewriteArticleMistral(summarizationPrompt, client);

      const savedArticle = saveArticle(article, summarizedArticle, version);
      if (checkValidity(savedArticle)) {
        await updateVersionValidities(articleId, version, true);
      }

      return savedArticle;
    } else {
      console.log(
        "Article already exists in the database",
        existingArticle.id + "-" + version
      );
      return existingArticle;
    }
  } catch (error) {
    console.error("Error during rewriting:", error);
    return {
      success: false,
      message: "Failed to rewrite softened article",
      error: error.message,
    };
  }
};

async function rewriteArticleMistral(userPrompt, client) {
  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.3,
      random_seed: 1698341829,
      responseFormat: {
        type: "json_object",
      },
      n: 1,
      safe_prompt: false,
    });

    // console.log("got chat response", chatResponse);

    console.log("rewrittenText", chatResponse.choices[0].message.content);
    let rewrittenText = JSON.parse(chatResponse.choices[0].message.content);
    console.log("rewrittenText parsed", rewrittenText.title);
    if (rewrittenText.hasCasualityNumbers === false) {
      console.log("return no casuality numbers ", rewrittenText);
      return { hasCasualityNumbers: rewrittenText.hasCasualityNumbers };
    }

    const article = {
      title: rewrittenText.title,
      lead: rewrittenText.lead !== undefined ? rewrittenText.lead : null,
      content: rewrittenText.content,
    };
    return article;
  } catch (error) {
    console.error("Error during rewriting:", error);
    return {
      success: false,
      message: "Failed to rewrite article",
      error: error.message,
    };
  }
}

function saveArticle(originalArticle, rewrittenArticle, version) {
  try {
    const article = new RewrittenArticle({
      ...rewrittenArticle,
      version: version,
      href: originalArticle.href,
      figures: originalArticle.figures,
      date: originalArticle.date,
      category: originalArticle.category,
      footer: originalArticle.footer,
      id: originalArticle.id,
    });
    article.save();
    return article;
  } catch (error) {
    console.error("Error saving article:", error);
    return false;
  }
}

async function updateVersionValidities(articleId, version, isValid) {
  const validityUpdate = {};
  validityUpdate["versions." + version] = isValid;
  console.log("Validity update:", validityUpdate, " for articleId:", articleId);
  await CrawlerQueue.updateOne(
    { id: articleId },
    {
      $set: validityUpdate,
    }
  );
}

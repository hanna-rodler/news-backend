import { Mistral } from "@mistralai/mistralai";
import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import dotenv from "dotenv";
import {
  getPrompt,
  getSummarizationPrompt,
  checkValidity,
} from "../utils/rewrite.mjs";
import { RewrittenArticle } from "../models/rewrittenArticle.mjs";
import { checkVersionName } from "../utils/utils.mjs";
dotenv.config();
const apiKey = process.env.MISTRAL_API_KEY;

export const rewriteSoftened = async (articleId, version) => {
  try {
    const existingArticle = await RewrittenArticle.findOne({
      _id: articleId + "-" + version,
    });
    if (!existingArticle) {
      const article = await RewrittenArticle.findOne({
        _id: articleId + "-original",
      });
      console.log(
        "rewriting article",
        article.title,
        " with version " + version
      );

      const userPrompt = getPrompt(version, article);
      let rewrittenArticle = await rewriteArticle(userPrompt);

      const savedArticle = saveArticle(article, rewrittenArticle, version);
      if (checkValidity(savedArticle)) {
        await updateVersionValidities(articleId, version, true);
      }

      return savedArticle;
    } else {
      console.log(
        `Article with version ${version} already exists in the database`,
        existingArticle
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

export const summarize = async (articleId, version, article = null) => {
  try {
    if (checkVersionName(version) === false) {
      throw new Error("Invalid version provided for summarization");
    }
    const existingArticle = await RewrittenArticle.findOne({
      _id: articleId + "-" + version,
    });
    if (!existingArticle) {
      if (!article) {
        article = await RewrittenArticle.findOne({
          _id: articleId + "-original",
        });
      }
      console.log("summarizing article", article.title, version);

      const isVeryShort = version.toLowerCase().includes("shortest")
        ? true
        : false;

      console.log("isVeryShort", isVeryShort);
      const summarizationPrompt = getSummarizationPrompt(article, isVeryShort);

      let summarizedArticle = await rewriteArticle(summarizationPrompt);

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
      message: "Failed to rewrite very soft article",
      error: error.message,
    };
  }
};

async function rewriteArticle(userPrompt) {
  try {
    const client = new Mistral({ apiKey: apiKey });
    console.log("init client");

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

    console.log("got chat response", chatResponse);

    let rewrittenText = [];

    console.log("rewrittenText", chatResponse.choices[0].message);
    rewrittenText[0] = JSON.parse(chatResponse.choices[0].message.content);
    // rewrittenText[1] = JSON.parse(chatResponse.choices[1].message.content);

    const article = {
      title: rewrittenText[0].title,
      lead: rewrittenText[0].lead !== undefined ? rewrittenText[0].lead : null,
      content: rewrittenText[0].content,
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
      _id: originalArticle.id + "-" + version,
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

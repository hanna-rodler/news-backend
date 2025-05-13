import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

import { CrawledArticle } from "../models/crawledArticles.mjs";
import { getPrompt } from "../utils/rewrite.mjs";
import { RewrittenArticle } from "../models/rewrittenArticle.mjs";
dotenv.config();
const apiKey = process.env.MISTRAL_API_KEY;

export const rewriteSofter = async () => {
  try {
    const article = await CrawledArticle.findOne({
      _id: articleId + "-original",
    });
    console.log("rewriting article", article.title, " with version soft");

    const userPrompt = getPrompt("softer", article);

    let rewrittenArticle = await rewriteArticle(userPrompt);

    const savedArticle = saveArticle(article, rewrittenArticle);

    return savedArticle;
  } catch (error) {
    console.error("Error during rewriting:", error);
    return {
      success: false,
      message: "Failed to rewrite very soft article",
      error: error.message,
    };
  }
};

export const rewriteVerySoft = async (articleId) => {
  try {
    const article = await CrawledArticle.findOne({
      _id: articleId + "-original",
    });
    console.log("rewriting article", article.title, " with version very soft");

    const userPrompt = getPrompt("verySoft", article);

    let rewrittenArticle = await rewriteArticle(userPrompt);

    const savedArticle = saveArticle(article, rewrittenArticle);

    return savedArticle;
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

function saveArticle(originalArticle, rewrittenArticle) {
  try {
    const article = new RewrittenArticle({
      ...rewrittenArticle,
      version: "verySoft",
      href: originalArticle.href,
      figures: originalArticle.figures,
      date: originalArticle.date,
      category: originalArticle.category,
      footer: originalArticle.footer,
      id: originalArticle.id,
      _id: originalArticle.id + "-verySoft",
    });
    article.save();
    return article;
  } catch (error) {
    console.error("Error saving article:", error);
    return false;
  }
}

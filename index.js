import express from "express";

import {
  getPrompt7b,
  getPrompt9c,
  getSofterPromptResponse,
  getVerySoftPromptResponse,
} from "./features/mistral.mjs";
import { scrapeWebsiteDetail, scrapeOrfHome } from "./features/webScraper.mjs";
// import { title, article, lead } from './articles/Trump-Grenell.js';
// import { title, article, lead } from './articles/israel-klinikdirektor.js';
import { article } from "./articles/femizid.js";
import {
  getArticle,
  getSofterPrompt,
  getVerySoftPrompt,
  isPromptNameValid,
} from "./utils/mistral.mjs";

var app = express();
app.get("/orf", async function (request, response) {
  await scrapeOrfHome("https://orf.at/")
    .then((result) => {
      response.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      response.send(error);
    });
});

app.get("/orf/detail", async function (req, response) {
  // "https://orf.at/stories/3380511/"
  await scrapeWebsiteDetail(req.query.story)
    .then((result) => {
      response.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      response.send(error);
    });
});

app.get("/mistral/prompt9c", async function (req, res) {
  console.log("req", req.query.temp);
  await getPrompt9c(req.query.temp, title, lead, article)
    .then((result) => {
      console.log("result", result);
      res.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      res.send(error);
    });
});

app.get("/mistral/prompt7b", async function (req, res) {
  console.log("req", req.query.temp);
  await getPrompt7b(
    req.query.temp,
    article.title,
    article.lead,
    article.content
  )
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      res.send(error);
    });
});

app.get("/mistral", async function (req, res) {
  const query = req.query;
  const promptName = query.promptName;
  let temp = query.temp;
  const articleId = query.articleId;
  // const examplePhrases = query.examplePhrases;
  if (temp == undefined || temp == "") {
    temp = 0.3;
  }
  if (articleId === undefined || articleId === "") {
    res.status(400);
    res.send("Error: Article id is not defined or invalid");
  }
  if (!isPromptNameValid(promptName)) {
    res.status(400);
    res.send("Error: Invalid prompt Name.");
  }
  const article = getArticle(articleId);
  if (article == undefined) {
    res.status(400);
    res.send("Error: Article id does not exist.");
  }
  console.log("get prompt for ", articleId);

  if (promptName.split("_")[1] === "s") {
    console.log("get Softer prompt response");
    await getSofterPromptResponse(promptName, temp, article)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log("error", error);
        res.send(error);
      });
  } else {
    await getVerySoftPromptResponse(promptName, temp, article)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log("error", error);
        res.send(error);
      });
  }
});

app.listen(4200, function () {
  console.log("Started application on port %d", 4200);
});

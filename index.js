import express from "express";
import crawlerRoutes from "./routes/crawler.routes.mjs";
import {
  getPrompt7b,
  getPrompt9c,
  getSofterPromptResponse,
  getVerySoftPromptResponse,
} from "./features/mistral.mjs";
import { connectToDB } from "./config/db.mjs";
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

app.use("/api/crawl", crawlerRoutes);

app.get("/status", (req, res) => {
  res.send("✅ Server is running");
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

const startServer = async () => {
  await connectToDB(process.env.MONGO_URI);
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
  );
};

startServer();

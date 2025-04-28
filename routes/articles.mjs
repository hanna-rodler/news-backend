import express from "express";
import dotenv from "dotenv";
import {
  saveArticle,
  scrapeArticles,
  articleExists,
} from "../controllers/articleController.mjs";
import { convertToTimestamp } from "../utils/utils.mjs";
dotenv.config();

const router = express.Router();

router.post("/articles/save", async (req, res) => {
  await saveArticle(req, res);
});

router.post("/crawl", async (req, res) => {
  await scrapeArticles()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.error("error", error);
      res
        .status(500)
        .json({ message: "Failed to scrape articles", error: error });
    });
});

router.get("/status", (req, res) => {
  res.send("✅ Server is running");
});

router.post("/test", async (req, res) => {
  const article = {
    title: "New: Auch Spitalsärzte wollen Pensionsprivileg für Schwerarbeit",
    content:
      "<p>Vor dem Hintergrund der von der Bundesregierung geplanten Aufnahme der Pflegeberufe in die Schwerarbeitspensionsregelung erheben nun auch die Ärzte und Ärztinnen in den Krankenhäusern Anspruch darauf.</p><p>Auch diese leisteten belastende Tätigkeiten, hätten unregelmäßige Arbeitszeiten und viele Nachtdienste, argumentierte Kim Haas, stellvertretende Obfrau in der Bundeskurie angestellte Ärzte in der Ärztekammer (ÖÄK), heute in einer Aussendung.</p><h2>„Hohe körperliche und psychische Belastung“</h2><p>„Hohe körperliche und psychische Belastung bei gleichzeitig noch höherer Anzahl an Arbeitsstunden als Pflegekräfte, das ist für Spitalsärztinnen und Spitalsärzte Alltag“, sagte Haas.</p><p>Die Schwerarbeitspension erlaubt einen Pensionsantritt schon ab 60, wenn 540 Versicherungsmonate (45 Jahre) erworben wurden und in mindestens zehn der letzten 20 Jahre Schwerarbeit geleistet wurde. Ein weiterer Vorteil sind die geringeren Abschläge bei einem früheren Antritt (1,8 statt 5,1 Prozent pro Jahr).</p>",
    version: "original",
    date: convertToTimestamp("15.04.2025 10.18"),
    footer:
      'red, ORF.at/<a href="https://orf.at/stories/impressum-nachrichtenagenturen/">Agenturen</a>',
    category: "PolitikInland",
    id: "339070913",
    _id: "339070913-original",
  };
  const fakeReq = { body: { article } };
  const fakeRes = {
    status: (statusCode) => ({
      json: (responseBody) => {
        console.log("Response:", statusCode, responseBody._id);
      },
    }),
  };
  const alreadyCrawled = await articleExists(article.id);
  console.log("getting details for ", article.id);
  if (alreadyCrawled) {
    console.log("⏭️ Already crawled:", article.id);
    res.send({ status: "201", message: "Article already crawled" });
  } else {
    const result = await saveArticle(fakeReq, fakeRes);
    res.send({
      status: "201",
      message: "Article newly crawled.",
      result: result,
    });
  }
});

export default router;

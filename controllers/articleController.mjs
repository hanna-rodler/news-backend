import { articleSchema } from "../models/articleSchema.mjs";
let puppeteer, chromium;
import dotenv from "dotenv";
import {
  cleanContent,
  getFormattedDateTime,
  convertToTimestamp,
} from "../utils/utils.mjs";
import { connectToDB } from "../config/db.mjs";
if (process.env.APP_ENV === "prod") {
  console.log("Running in Vercel prod mode!");
  puppeteer = (await import("puppeteer-core")).default;
  chromium = (await import("@sparticuz/chromium")).default;
} else {
  console.log("Running in local development mode with full puppeteer");
  puppeteer = (await import("puppeteer")).default;
}

dotenv.config();

const { MONGO_DB_COLLECTION } = process.env;

const db = await connectToDB();
const collection = db.collection(MONGO_DB_COLLECTION);

export async function scrapeArticles() {
  try {
    let launchOptions = {
      headless: true, // Default to headless in production
    };

    if (process.env.APP_ENV === "prod") {
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const url = "https://orf.at/";
    await page.goto(url);

    const results = await page.evaluate(() => {
      const ressorts = ["ukraine-krieg", "inland", "ausland", "gaza"];
      const hasMatchingClass = (element) => {
        return ressorts.some((ressort) => element.classList.contains(ressort));
      };

      // Find all elements with `data-oewatag` containing "politik"
      const elements = Array.from(
        document.querySelectorAll("[data-oewatag]")
      ).filter((el) => /politik/i.test(el.getAttribute("data-oewatag")));
      const mappedElements = elements.map((el) => {
        const subtarget = el.getAttribute("data-adworxsubtarget");
        const anchor = el.firstElementChild.firstElementChild.firstElementChild;
        const href = anchor.getAttribute("href");
        const id = href.split("/")[4];
        const headline = anchor.innerText;

        // const anchorInfo = getAnchorInfo(parent);
        return {
          subtarget,
          id: id ? id : null,
          href: href ? href : null,
          headline: headline ? headline.trim() : null,
        };
      });

      // not all elements have a data-oewatag
      const additionalElements = Array.from(
        document.querySelectorAll(".ticker-story.ticker-story-quicklink")
      );
      const mappedAdditionalElements = additionalElements.map((el) => {
        //   console.log(
        //     "el parent",
        //     el.parentElement.parentElement.parentElement.outerHTML
        //   );
        const tickerParent = el.parentElement.parentElement.parentElement;
        if (hasMatchingClass(tickerParent)) {
          const anchor =
            el.firstElementChild.firstElementChild.firstElementChild;
          const href = anchor.getAttribute("href");
          const id = href.split("/")[4];
          const headline = anchor.innerText;
          return {
            subtarget: tickerParent.classList[1],
            id: id ? id : null,
            href: href ? href : null,
            headline: headline ? headline.trim() : null,
          };
        }
      });
      const filteredAdditionalElements = mappedAdditionalElements.filter(
        (item) => item != null
      );

      return mappedElements.concat(filteredAdditionalElements);
    });

    // ticker-story ticker-story-quicklink <- add
    const details = await scrapeDetail(results, browser);
    return { "saved num of articles": details.length };
  } catch (error) {
    console.error("Error during scraping:", error);
    return {
      message: "Failed to scrape articles in scrapeArticles()",
      error: error.message,
    };
  }
  // return results;
}

// export async function scrapeArticles() {
//   try {
//     let launchOptions = {
//       headless: true, // Default to headless in production
//     };

//     if (process.env.APP_ENV === "prod") {
//       launchOptions = {
//         args: chromium.args,
//         defaultViewport: chromium.defaultViewport,
//         executablePath: await chromium.executablePath(),
//         headless: chromium.headless,
//       };
//     }

//     const browser = await puppeteer.launch(launchOptions);
//     console.log("Browser launched successfully on Vercel!");
//     await browser.close();
//     return { message: "Browser launched successfully" };
//   } catch (error) {
//     console.error("Error launching browser:", error);
//     return { message: "Failed to launch browser", error: error.message };
//   }
// }

async function scrapeDetail(stories, browser) {
  // const browser = await puppeteer.launch({
  //   args: chromium.args,
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: await chromium.executablePath(),
  //   headless: chromium.headless,
  // });
  const storyDetails = [];

  try {
    for (let story of stories) {
      const storyId = story.id;
      const alreadyCrawled = await articleExists(storyId);
      console.log("getting details for ", storyId);
      if (alreadyCrawled) {
        console.log("⏭️ Already crawled:", storyId);
        continue;
      }

      // better here get storyIds und dann pro StoryId durchlaufen
      const url = "https://orf.at/stories/" + storyId + "/";
      const page = await browser.newPage();
      await page.goto(url);

      const article = {
        title: story.headline,
        lead: null,
        content: null,
        figures: null,
        version: "original",
        date: null,
        footer: null,
        category: story.subtarget,
        id: story.id,
        _id: `${story.id}-original`,
      };

      try {
        for (let story of stories) {
          const storyId = story.id;
          const alreadyCrawled = await articleExists(storyId);
          console.log("getting details for ", storyId);
          if (alreadyCrawled) {
            console.log("⏭️ Already crawled:", storyId);
            continue;
          }

          // better here get storyIds und dann pro StoryId durchlaufen
          const url = "https://orf.at/stories/" + storyId + "/";
          const page = await browser.newPage();
          await page.goto(url);

          const article = {
            title: story.headline,
            lead: null,
            content: null,
            figures: null,
            version: "original",
            date: null,
            footer: null,
            category: story.subtarget,
            id: story.id,
            _id: `${story.id}-original`,
          };

          try {
            // Lead
            try {
              const lead = await page.$eval(".story-lead-text", (el) =>
                el.innerText.trim()
              );
              article.lead = lead;
            } catch (error) {
              // console.warn("Lead not found:", error.message);
            }

            // Date
            try {
              const date = await page.$eval(
                "div.story-meta-dates div.print-only",
                (element) => element.innerHTML.trim()
              );
              article.date = convertToTimestamp(date);
            } catch (error) {
              console.warn("Date not found:", error.message);
            }

            // Content
            try {
              const storyContent = await page.$eval(
                "div.story-story",
                (element) => element.innerHTML.trim()
              );
              const { cleanedText, figures } = cleanContent(storyContent);
              article.content = cleanedText;
              if (figures.length > 0) {
                article.figures = figures;
              }
              // article.contentWithQ = markQuotes(cleanedText);
            } catch (error) {
              console.warn("Content not found:", error.message);
            }

            // Footer
            try {
              article.footer = await page.$eval(
                "div.story-footer div.byline p",
                (el) => el.innerHTML.trim()
              );
            } catch (error) {
              console.warn("Footer not found:", error.message);
            }

            // remove all variables with null value from article
            Object.keys(article).forEach((key) => {
              if (article[key] === null) {
                delete article[key];
              }
            });
            storyDetails.push(article);
            sendArticleToSave(article);
          } catch (error) {
            console.error("Could not find the div.story-story:", error);
          }
        }

        await browser.close();
        // return data;
        return storyDetails;
      } catch (error) {
        console.error("Error during scraping details:", error);
        return {
          message: "Failed to scrape article details",
          error: error.message,
        };
      }
    }

    await browser.close();
    // return data;
    return storyDetails;
  } catch (error) {
    console.error("Error during scraping details:", error);
    return {
      message: "Failed to scrape article details",
      error: error.message,
    };
  }
}

async function sendArticleToSave(article) {
  const fakeReq = { body: { article } };
  const fakeRes = {
    status: (statusCode) => ({
      json: (responseBody) => {
        console.log("Response:", statusCode, responseBody._id);
      },
    }),
  };

  await saveArticle(fakeReq, fakeRes);
}

export async function saveArticle(req, res) {
  try {
    console.log("save article ", req.body.article._id);
    const { error, value: article } = articleSchema.validate(req.body.article);

    if (error) {
      return res
        .status(400)
        .json({ error: "Invalid article", details: error.details });
    }

    const result = await collection.insertOne(article);
    console.log("result ", result);
    const inserted = await collection.findOne({ _id: result.insertedId });

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Save article error:", err);
    res.status(500).json({ error: "Failed to save article" });
  }
}

export async function articleExists(articleId) {
  console.log("checking if article ", articleId, "exists");
  const id = `${articleId}-original`;
  const db = await connectToDB();
  const collection = db.collection(MONGO_DB_COLLECTION);
  const existing = await collection.findOne({ _id: id });
  return !!existing;
}

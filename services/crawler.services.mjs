let puppeteer, chromium;
import {
  cleanContent,
  convertToTimestamp,
  addTargetBlank,
} from "../utils/utils.mjs";
import dotenv from "dotenv";
import { CrawlerQueue } from "../models/crawlerQueue.mjs";
import { RewrittenArticle } from "../models/rewrittenArticle.mjs";
if (process.env.APP_ENV === "prod") {
  console.log("Running in prod mode!");
  puppeteer = (await import("puppeteer-core")).default;
  chromium = (await import("@sparticuz/chromium")).default;
} else {
  console.log("Running in local development mode with full puppeteer");
  puppeteer = (await import("puppeteer")).default;
}

dotenv.config();

export const crawlOverview = async () => {
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
          _id: `${id}-original`,
        };
      });

      // not all elements have a data-oewatag
      const additionalElements = Array.from(
        document.querySelectorAll(".ticker-story.ticker-story-quicklink")
      );
      const mappedAdditionalElements = additionalElements.map((el) => {
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
            _id: `${id}-original`,
          };
        }
      });
      const filteredAdditionalElements = mappedAdditionalElements.filter(
        (item) => item != null
      );

      return mappedElements.concat(filteredAdditionalElements);
    });

    for (const result of results) {
      console.log("Result: ", result._id, result.id);
      const existingElement = await CrawlerQueue.findOne({ _id: result._id });
      if (!existingElement) {
        const crawlerQueueEl = new CrawlerQueue(result);
        try {
          await crawlerQueueEl.save();
          console.log("Element saved to the database ", crawlerQueueEl);
        } catch (error) {
          console.error("Error saving element to the database:", error, result);
        }
      } else {
        console.log("Element already exists in the database ", result._id);
      }
    }

    // TODO ticker-story ticker-story-quicklink <- add
    return results;
  } catch (error) {
    console.error("Error during scraping:", error);
    return [];
  }
};

// TODO: make sure that an error never occurs.
export const crawlDetails = async (req, res) => {
  const articleDetails = [];
  const articleOverview = await CrawlerQueue.find().limit(50);
  let nonExistingArticles = 0;
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
    for (const articleOverviewItem of articleOverview) {
      console.log("crawling article details for ", articleOverviewItem.id);
      const existingArticle = await RewrittenArticle.findOne({
        _id: `${articleOverviewItem.id}-original`,
      });
      if (!existingArticle) {
        nonExistingArticles = nonExistingArticles + 1;
        const article = {
          title: articleOverviewItem.headline,
          lead: null,
          content: null,
          figures: null,
          version: "original",
          date: null,
          footer: null,
          href: articleOverviewItem.href,
          category: articleOverviewItem.subtarget,
          id: articleOverviewItem.id,
          _id: `${articleOverviewItem.id}-original`,
        };
        console.log("Crawling article details for ", article);
        const url = "https://orf.at/stories/" + articleOverviewItem.id + "/";
        const page = await browser.newPage();
        await page.goto(url);

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
            const footer = await page.$eval(
              "div.story-footer div.byline p",
              (el) => el.innerHTML.trim()
            );
            console.log("Footer found:", footer);
            const cleanedFotter = addTargetBlank(footer);
            console.log("Footer cleaned:", cleanedFotter);
            article.footer = cleanedFotter;
          } catch (error) {
            console.warn("Footer not found:", error.message);
          }

          // remove all variables with null value from article
          Object.keys(article).forEach((key) => {
            if (article[key] === null) {
              delete article[key];
            }
          });

          const crawledArticle = new RewrittenArticle(article);
          try {
            crawledArticle.save();
            console.log("Article saved to the database ", crawledArticle);
          } catch (error) {
            console.error(
              "Error saving article to the database:",
              error,
              crawledArticle
            );
          }
          articleDetails.push(article);
        } catch (error) {
          console.error("Could not find the div.story-story:", error);
        }
      } else {
        console.log(
          "Article already exists in the database ",
          existingArticle._id
        );
      }
    }
    return {
      shouldSaveCount: nonExistingArticles,
      articleDetails: articleDetails,
    };
  } catch (error) {
    console.error("Error during scraping:", error);
    return { queued: articleOverview.length, articleDetails: articleDetails };
  }
};

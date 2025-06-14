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
    console.log("Crawling overview");

    const results = await page.evaluate(async () => {
      console.log("Evaluating page for overview crawl");
      const ressorts = ["ukraine-krieg", "inland", "ausland", "gaza"];
      const hasMatchingClass = (element) => {
        console.log("Checking element: ", element.classList);
        return ressorts.some((ressort) => element.classList.contains(ressort));
      };

      // get all elments from oon-grid
      const oonGridElements = Array.from(
        document.querySelectorAll(".oon-grid .oon-grid-item")
      );
      const oonGridElementsToEvaluate = [];
      console.log("Found oon-grid elements: ", oonGridElements.length);
      for (const el of oonGridElements) {
        console.log("Element: ", el);
        // get a tag
        const anchor = el.querySelector("a");
        if (anchor) {
          // follow that link
          const href = anchor.getAttribute("href");
          if (href.includes("orf.at/stories/")) {
            const id = href.split("/")[4];
            let headline = anchor
              .getElementsByClassName("oon-grid-texts-headline")[0]
              .innerText.trim();
            headline = headline.replace(/\n/g, "").replace(/\s{2,}/g, " ");
            oonGridElementsToEvaluate.push({
              href: href,
              id: id ? Number(id) : null,
              headline: headline ? headline : null,
              isWaitingForCategoryEvaluation: true,
            });
          }
        }
      }

      // // Find all elements with `data-oewatag` containing "politik"
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
          id: id ? Number(id) : null,
          href: href ? href : null,
          headline: headline ? headline.trim() : null,
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
            id: id ? Number(id) : null,
            href: href ? href : null,
            headline: headline ? headline.trim() : null,
          };
        }
      });
      const filteredAdditionalElements = mappedAdditionalElements.filter(
        (item) => item != null
      );

      return mappedElements
        .concat(filteredAdditionalElements)
        .concat(oonGridElementsToEvaluate);
    });

    const updatedArticles = [];

    for (const result of results) {
      console.log("Result: ", result.id);
      let existingElement = await CrawlerQueue.findOne({ id: result.id });
      if (!existingElement) {
        existingElement = await RewrittenArticle.findOne({ id: result.id });
      }
      if (!existingElement) {
        const crawlerQueueEl = new CrawlerQueue(result);
        updatedArticles.push(crawlerQueueEl);
        try {
          await crawlerQueueEl.save();
          // console.log("Element saved to the database ", crawlerQueueEl);
        } catch (error) {
          console.error("Error saving element to the database:", error, result);
        }
      } else {
        console.log("Element already exists in the database ", result.id);
      }
    }

    // TODO ticker-story ticker-story-quicklink <- add
    return updatedArticles;
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
  let skippedArticles = [];
  let savedArticles = 0;
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
      const existingArticle = await RewrittenArticle.findOne({
        id: articleOverviewItem.id,
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
          category: articleOverviewItem.subtarget
            ? articleOverviewItem.subtarget.toLowerCase()
            : null,
          id: articleOverviewItem.id,
          isWaitingForCategoryEvaluation:
            articleOverviewItem.isWaitingForCategoryEvaluation
              ? articleOverviewItem.isWaitingForCategoryEvaluation
              : false,
        };
        const url = articleOverviewItem.href;
        const page = await browser.newPage();
        await page.goto(url);

        try {
          if (articleOverviewItem.isWaitingForCategoryEvaluation) {
            const oewaPath = await page.$$eval("script", (scripts) => {
              if (scripts.length > 0) {
                for (const script of scripts) {
                  const text = script.textContent || "";

                  const match = text.match(
                    /var\s+oewa_path\s*=\s*["']([^"']+)["']/
                  );
                  if (match) {
                    return match[1];
                  }
                }
              }
              return null;
            });

            if (
              !oewaPath ||
              !oewaPath.includes("/Politik/") ||
              oewaPath.split("/").length < 3
            ) {
              nonExistingArticles = nonExistingArticles - 1;
              console.log(
                "Skipping article due to missing or invalid oewaPath:",
                article.id
              );
            }

            // Only now assign the clean category
            console.log("oewaPath", oewaPath);
            article.category = oewaPath.split("/")[2].toLowerCase();
          }

          console.log("article", article.title, "category", article.category);
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
            const cleanedFotter = addTargetBlank(footer);
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

          if (article.category === "inland") {
            article.category = "politikinland";
          } else if (article.category === "ausland") {
            article.category = "politikausland";
          }
          const crawledArticle = new RewrittenArticle(article);
          try {
            const validCategories = [
              "wirtschaftspolitik",
              "politikausland",
              "politikinland",
              "ukraine-krieg",
              "gaza",
            ];
            if (validCategories.includes(article.category)) {
              savedArticles = savedArticles + 1;
              crawledArticle.save();
              console.log(
                "Article saved to the database ",
                crawledArticle.title,
                crawledArticle.id,
                crawledArticle.category
              );
              articleDetails.push(article);
            } else {
              skippedArticles.push(article.id);
              await CrawlerQueue.deleteOne({ id: article.id });
              console.warn(
                `Article category "${article.category}" is not valid. Skipping article.`
              );
            }
          } catch (error) {
            console.error(
              "Error saving article to the database:",
              error,
              crawledArticle
            );
          }
        } catch (error) {
          console.error("Could not find the div.story-story:", error);
        }
      } else {
        console.log(
          "Article already exists in the database ",
          existingArticle.id
        );
      }
    }
    return {
      shouldSaveCount: nonExistingArticles,
      skippedArticles: skippedArticles,
      savedArticles: savedArticles,
      articleDetails: articleDetails,
    };
  } catch (error) {
    console.error("Error during scraping:", error);
    return { queued: articleOverview.length, articleDetails: articleDetails };
  }
};

import puppeteer from "puppeteer";
import {
  cleanContent,
  getFormattedDateTime,
  saveToFile,
} from "../utils/utils.mjs";

const processedIds = new Map();

export async function scrapeWebsiteDetail(storyId, category) {
  const url = "https://orf.at/stories/" + req.query.story + "/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const article = {
    title: null,
    lead: null,
    // leadWithQ: null,
    content: null,
    // contentWithQ: null,
    figures: null,
    day: null,
    month: null,
    year: null,
    time: null,
    footer: null,
  };

  try {
    // Title
    try {
      article.title = await page.$eval(
        "h1.story-lead-headline",
        (element) => element.innerText
      );
    } catch (error) {
      console.warn("Title not found:", error.message);
    }

    // Lead
    try {
      const lead = await page.$eval(".story-lead-text", (el) =>
        el.innerText.trim()
      );
      article.lead = lead;
      // article.leadWithQ = markQuotes(lead);
    } catch (error) {
      console.warn("Lead not found:", error.message);
    }

    // Date
    try {
      const date = await page.$eval(
        "div.story-meta-dates div.print-only",
        (element) => element.innerHTML.trim()
      );
      // spit 12.04.2025 14.54 into day, month, year and time
      const dateParts = date.split(" ");
      const day = dateParts[0].split(".")[0];
      const month = dateParts[0].split(".")[1];
      const year = dateParts[0].split(".")[2];
      const time = dateParts[1];
      article.day = day;
      article.month = month;
      article.year = year;
      article.time = time;
    } catch (error) {
      console.warn("Date not found:", error.message);
    }

    // Content
    try {
      const storyContent = await page.$eval("div.story-story", (element) =>
        element.innerHTML.trim()
      );
      const { cleanedText, figures } = cleanContent(storyContent);
      article.content = cleanedText;
      article.figures = figures;
      // article.contentWithQ = markQuotes(cleanedText);
    } catch (error) {
      console.warn("Content not found:", error.message);
    }

    // Footer
    try {
      article.footer = await page.$eval("div.story-footer div.byline p", (el) =>
        el.innerHTML.trim()
      );
    } catch (error) {
      console.warn("Footer not found:", error.message);
    }
  } catch (error) {
    console.error("Could not find the div.story-story:", error);
  }

  await browser.close();
  // return data;
  // TODO: if article.x etc. then markAsProcessed
  return article;
}

export async function scrapeWebsiteDetailBE(stories) {
  const browser = await puppeteer.launch();
  const storyDetails = [];

  for (let story of stories) {
    const storyId = story.id;
    console.log("getting details for ", storyId);
    // better here get storyIds und dann pro StoryId durchlaufen
    const url = "https://orf.at/stories/" + storyId + "/";
    const page = await browser.newPage();
    await page.goto(url);

    const article = {
      title: story.headline,
      lead: null,
      content: null,
      figures: null,
      date: null,
      day: null,
      month: null,
      year: null,
      time: null,
      footer: null,
      category: story.subtarget,
      id: story.id,
    };

    try {
      // Title
      // try {
      //   article.title = await page.$eval(
      //     "h1.story-lead-headline",
      //     (element) => element.innerText
      //   );
      // } catch (error) {
      //   console.warn("Title not found:", error.message);
      // }

      // Lead
      try {
        const lead = await page.$eval(".story-lead-text", (el) =>
          el.innerText.trim()
        );
        article.lead = lead;
        // article.leadWithQ = markQuotes(lead);
      } catch (error) {
        console.warn("Lead not found:", error.message);
      }

      // Date
      try {
        const date = await page.$eval(
          "div.story-meta-dates div.print-only",
          (element) => element.innerHTML.trim()
        );
        article.date = date;
        // spit 12.04.2025 14.54 into day, month, year and time
        const dateParts = date.split(" ");
        const day = dateParts[0].split(".")[0];
        const month = dateParts[0].split(".")[1];
        const year = dateParts[0].split(".")[2];
        const time = dateParts[1];
        article.day = day;
        article.month = month;
        article.year = year;
        article.time = time;
      } catch (error) {
        console.warn("Date not found:", error.message);
      }

      // Content
      try {
        const storyContent = await page.$eval("div.story-story", (element) =>
          element.innerHTML.trim()
        );
        const { cleanedText, figures } = cleanContent(storyContent);
        article.content = cleanedText;
        article.figures = figures;
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

      storyDetails.push(article);
      console.log("story Details length ", storyDetails.length);
    } catch (error) {
      console.error("Could not find the div.story-story:", error);
    }
  }

  await browser.close();
  // return data;
  // TODO: if article.x etc. then markAsProcessed
  return storyDetails;
}

export async function scrapeOrfHome(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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
      console.log(
        "el parent",
        el.parentElement.parentElement.parentElement.outerHTML
      );
      const tickerParent = el.parentElement.parentElement.parentElement;
      if (hasMatchingClass(tickerParent)) {
        const anchor = el.firstElementChild.firstElementChild.firstElementChild;
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
  // Log the results
  // TODO: MongoDB check for existing ids.
  // TODO: await scrapeWebsiteDetail(id, subtarget);
  // if (processedIds.has(id)) {
  //   console.log("Already processed:", id);
  //   continue;
  // }
  const details = await scrapeWebsiteDetailBE(results);
  console.log("detail result", details);
  // processedIds.set(id, true);
  const fileName = `${getFormattedDateTime()}.json`;
  saveToFile(JSON.stringify(details), "./../orf_home", fileName);
  return details;
}

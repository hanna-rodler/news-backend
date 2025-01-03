import puppeteer from 'puppeteer';
import { cleanContent, markQuotes, getFormattedDateTime, saveToFile } from '../utils/utils.mjs';

export async function scrapeWebsiteDetail(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const article = {
    title: null,
    lead: null,
    leadWithQ: null,
    content: null,
    contentWithQ: null,
    figures: null,
    date: null,
    footer: null,
  }

  try {
    // Title
    try {
      article.title = await page.$eval('h1.story-lead-headline', (element) => element.innerText);
    } catch (error) {
      console.warn('Title not found:', error.message);
    }

    // Lead
    try {
      const lead = await page.$eval('.story-lead-text', el => el.innerText.trim());
      article.lead = lead;
      article.leadWithQ = markQuotes(lead);
    } catch (error) {
      console.warn("Lead not found:", error.message);
    }

    // Date
    try {
      article.date = await page.$eval('div.story-meta-dates div.print-only', element => element.innerHTML.trim());
    } catch (error) {
      console.warn('Date not found:', error.message);
    }

    // Content
    try {
      const storyContent = await page.$eval('div.story-story', element => element.innerHTML.trim());
      const {cleanedText, figures} = cleanContent(storyContent);
      article.content = cleanedText;
      article.figures = figures;
      article.contentWithQ = markQuotes(cleanedText);
    } catch (error) {
      console.warn('Content not found:', error.message);
    }

    // Footer
    try {
      article.footer = await page.$eval('div.story-footer div.byline p', el => el.innerHTML.trim());
    } catch (error) {
      console.warn('Footer not found:', error.message);
    }
  } catch (error) {
    console.error('Could not find the div.story-story:', error);
  }

  await browser.close();
  // return data;
  return article;
}

export async function scrapeOrfHome(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const results = await page.evaluate(() => {
      const ressorts = ["ukraine-krieg", "inland", "ausland", "gaza"];
      const hasMatchingClass = (element) => {
        return ressorts.some(ressort => element.classList.contains(ressort));
      };

      // Find all elements with `data-oewatag` containing "politik"
      const elements = Array.from(document.querySelectorAll('[data-oewatag]'))
          .filter(el => /politik/i.test(el.getAttribute('data-oewatag')));
      const mappedElements = elements.map(el => {
        const subtarget = el.getAttribute('data-adworxsubtarget');
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
      const additionalElements = Array.from(document.querySelectorAll('.ticker-story.ticker-story-quicklink'));
      const mappedAdditionalElements = additionalElements.map(el => {
        console.log('el parent', el.parentElement.parentElement.parentElement.outerHTML);
        const tickerParent = el.parentElement.parentElement.parentElement;
        if(hasMatchingClass(tickerParent)) {
          const anchor = el.firstElementChild.firstElementChild.firstElementChild;
          const href = anchor.getAttribute("href");
          const id = href.split("/")[4];
          const headline = anchor.innerText;
          return {
            subtarget: tickerParent.classList[1],
            id: id ? id : null,
            href: href ? href : null,
            headline: headline ? headline.trim() : null,
          }
        }
      })
      const filteredAdditionalElements = mappedAdditionalElements.filter(item => item != null);

      return mappedElements.concat(filteredAdditionalElements);
    });

// ticker-story ticker-story-quicklink <- add
// Log the results
  const fileName = `${getFormattedDateTime()}.json`;
  saveToFile(JSON.stringify(results), "./../orf_home", fileName);
  return results;
}
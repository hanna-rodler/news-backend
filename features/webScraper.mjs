import puppeteer from 'puppeteer';
import { cleanContent, markQuotes } from '../utils/utils.mjs';

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

  // try {
  //   console.log('try with query');
  //   articles = await page.evaluate(() => {
  //     Array.from(document.querySelectorAll('article[data-adworxsubtarget]'));
  //         // .map(heading => heading.innerText); })
  //   console.log('articles', articles);
  //       // Politik Ausland
  //       // const politicsAbroad = await page.$eval('article[data-adworxsubtarget="PolitikAusland"]')
  //       // console.log(politicsAbroad);
  //       // Politik Inland
        
  //       // Wirtschaftspolitik
  // } catch(error) {
  //   console.log('error', error);
  // }

  //   const results = await page.evaluate(() => {
  //     // Get all elements with `data-adworxsubtarget` containing "politik" (case-insensitive)
  //     const elements = Array.from(document.querySelectorAll('[data-adworxsubtarget]'))
  //         .filter(el => /politik/i.test(el.getAttribute('data-adworxsubtarget')));

  //     // Collect results
  //     return elements.map(el => {
  //         const subtarget = el.getAttribute('data-adworxsubtarget');
  //         const nextAnchor = el.nextElementSibling?.tagName === 'A' ? el.nextElementSibling : null;
  //         const href = nextAnchor?.getAttribute('href') || null;
  //         const text = nextAnchor?.textContent || null;

  //         return { subtarget, href, text };
  //     });
  // });
  // console.log('all adworx elements', document.querySelectorAll('[data-adworxsubtarget]'));
  // console.log('quick', document.querySelectorAll('ticker-story ticker-story-quicklink'));
  
  const results = await page.evaluate(() => {
      const ressorts = ["ukraine-krieg", "inland", "ausland", "gaza"];
      const hasMatchingClass = (element) => {
        return ressorts.some(ressort => element.classList.contains(ressort));
      };

      // Find all elements with `data-oewatag` containing "politik"
      const elements = Array.from(document.querySelectorAll('[data-oewatag]'))
          .filter(el => /politik/i.test(el.getAttribute('data-oewatag')));

      const additionalElements = Array.from(document.querySelectorAll('.ticker-story.ticker-story-quicklink'));
      const mappedAdditionalElements = additionalElements.map(el => {
        console.log('el parent', el.parentElement.parentElement.parentElement.outerHTML);
        const tickerParent = el.parentElement.parentElement.parentElement;
        const anchor = el.firstElementChild.firstElementChild.firstElementChild;
        const href = anchor.getAttribute("href");
        const id = href.split("/")[4];
        const headline = anchor.innerText;
        if(hasMatchingClass(tickerParent)) {
          return {
            subtarget: tickerParent.classList[1],
            id: id ? id : null,
            href: href ? href : null,
            headline: headline ? headline : null,
          }
        } else {
          return {
            notwanted: headline,
          }
        }
      })

      // Collect results
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
              headline: headline ? headline : null,
          };
      });

      return mappedElements.concat(mappedAdditionalElements);
    });

// ticker-story ticker-story-quicklink <- add
// Log the results
  return results;
}

export async function scrapeWebsiteStandard(url) {
    console.log('scrape website with url', url)
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2'});
    console.log('went to url');
    // await page.setViewport({width: 1080, height: 1024});

    // await page.locator('button[aria-label="Einverstanden"]').click();
    // Capture the page content before waiting for the selector
    const initialContent = await page.content("div.sp_message_container_1030279");
    console.log('Page content before waiting for the button:');
    console.log(initialContent);

    // await page.waitForSelector('button[aria-label="Einverstanden"]');
    // await page.click('button[aria-label="Einverstanden"]');

    await page.waitForSelector(".article-body");
    const content = await page.content();
    console.log('content', content);
      
    // // Example: Extract all h1 elements
    // const data = await page.evaluate(() => {
    //     console.log('get content');
    //     const divs = Array.from(document.querySelectorAll(".message-component message-column"));
    //     const articleBody = document.querySelector(".article-body");
    //     console.log("article body", articleBody);
    //     return divs.map((h) => h.textContent);
    //     // return document;
    // });
    // console.log('data', data);

    await browser.close();
    // return data;
    return content;
}
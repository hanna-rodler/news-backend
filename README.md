# Backend: News Crawler & Processor

- 1. `/api/crawl/overview` scrapes political news articles overview
- 2. `/api/crawl/details` scrapes article details and saves them to DB
- 3. `/api/rewrite/softer/all` rewrites all articles to softer version incl. shortened
- 4. `/api/rewrite/very-soft/all` rewrites all articles to very soft version incl. shortened
- 5. `/api/rewrite/original/all` rewrites all articles to shortened version
- `features/mistral.mjs` handles prompt rewriting

TODOs:

- create cronjob for automatic scraping
- select 1-2 prompts after survey evaluation

## Run Vercel deployment locally:

`npm i -g vercel`
`vercel login`
`vercel dev`

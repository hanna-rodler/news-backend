# Backend: News Crawler & Processor

- `/api/crawl/overview` scrapes political news articles overview
- `/api/crawl/details` scrapes article details and saves them to DB
- `features/mistral.mjs` handles prompt rewriting

TODOs:

- create cronjob for automatic scraping
- select 1-2 prompts after survey evaluation

## Run Vercel deployment locally:

`npm i -g vercel`
`vercel login`
`vercel dev`

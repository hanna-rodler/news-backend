import express from 'express';

import { getPrompt7b, getPrompt9c, test } from './features/mistral.mjs';
import { scrapeWebsiteDetail, scrapeOrfHome } from './features/webScraper.mjs';
// import { title, article, lead } from './articles/Trump-Grenell.js';
// import { title, article, lead } from './articles/israel-klinikdirektor.js';
import { article } from './articles/femizid.js';

var app = express();
app.get("/orf", async function(request, response) {
    await scrapeOrfHome(
  "https://orf.at/"
)
  .then((result) =>  { response.send(result) })
  .catch((error) => { console.log('error', error); response.send(error)});
});

app.get("/orf", async function(req, response) {
  // "https://orf.at/stories/3380511/"
  const url = "https://orf.at/stories/" + req.query.story + "/"
    await scrapeWebsiteDetail(url)
  .then((result) =>  {
    response.send(result) })
  .catch((error) => { console.log('error', error); response.send(error)});
});

app.get("/mistral/prompt9c", async function(req, res) {
  console.log('req', req.query.temp);
  await getPrompt9c(req.query.temp, title, lead, article)
  .then((result) => {console.log('result', result); res.send(result)})
  .catch((error) => {console.log('error', error); res.send(error)})
})

app.get("/mistral/prompt7b", async function(req, res) {
  console.log('req', req.query.temp);
  await getPrompt7b(req.query.temp, article.title, article.lead, article.content)
  .then((result) => { res.send(result)})
  .catch((error) => {console.log('error', error); res.send(error)})
})


app.listen(4200, function(){
    console.log("Started application on port %d", 4200);
})


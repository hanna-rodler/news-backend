import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

export function markQuotes(text) {
  return text
    .replace(/„.*?“|„.*?“.?/g, (match) => `[Q]${match}[/Q]`)
    .replace(/".*?"|".*?".?/g, (match) => `[Q]${match}[/Q]`);
}

export function cleanContent(text) {
  const cleanedText = text
    .replace(
      /<div class="story-banner story-horizontal-ad"[\s\S]*?<\/div>/g,
      ""
    )
    // Remove adworx information and its children
    .replace(/<div class="adworx-wrapper"[\s\S]*?<\/div>/g, "")
    .replace(/<div id="adworx-content"[\s\S]*?<\/div>/g, "")
    .replace(/<aside class="linkcard"[\s\S]*?<\/aside>/g, "")
    .replace(/<p class="caption tvthek stripe-credits"[\s\S]*?<\/p>/g, "")
    .replace(/<div class="stripe-video-wrapper"[\s\S]*?<\/div>/g, "")
    .replace(/<section class="stripe [\s\S]*?<\/section>/g, "")
    .replace(/<div class="player"[\s\S]*?<\/div>/g, "")
    .replace(/\n+/g, "")
    .trim();

  const articleAndFigures = extractFiguresAndReplace(cleanedText);
  return {
    cleanedText: articleAndFigures.updatedText.trim(),
    figures: articleAndFigures.figures,
  };
}

function extractFiguresAndReplace(text) {
  const figures = [];

  // Regex to match <figure>...</figure> elements
  const figureRegex = /<figure[\s\S]*?<\/figure>/g;
  // const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;

  // Replace <figure> elements with <<fig>> and extract their content
  let updatedText = text.replace(figureRegex, (match) => {
    figures.push(match.trim()); // Save the <figure> content
    return "<figplaceholder></figplaceholder>";
  });

  // updatedText = text.replace(imgRegex, (match) => {
  //   figures.push(match.trim()); // Save the <figure> content
  //   return "<imgplaceholder></imgplaceholder>";
  // });

  return { updatedText, figures };
}

export function getFormattedDateTime() {
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, "0"); // Pads single digits with a leading zero

  const year = now.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = pad(now.getMonth() + 1); // Months are 0-based
  const date = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `${year}-${month}-${date}_${hours}-${minutes}`;
}

export function saveToFile(content, folder, fileName) {
  const dirPath = path.join(__dirname, folder);
  const filePath = path.join(dirPath, fileName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write content to the file
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`File written: ${filePath}`);
}

export function convertToTimestamp(dateString) {
  // Split the date and time parts
  const [datePart, timePart] = dateString.split(" ");
  const [day, month, year] = datePart.split(".").map(Number);
  const [hour, minute] = timePart.split(".").map(Number);

  // Month in JavaScript Date object is 0-indexed
  const jsMonth = month - 1;

  // Create a new JavaScript Date object (which MongoDB uses)
  const date = new Date(year, jsMonth, day, hour, minute, 0, 0);

  return date;
}

// Adds target="_blank" to all <a> tags in the input HTML string
export function addTargetBlank(text) {
  return text.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    // If target already exists, replace it; otherwise, add it
    if (/target\s*=\s*(['"])[^'"]*\1/i.test(attrs)) {
      return `<a${attrs.replace(
        /target\s*=\s*(['"])[^'"]*\1/i,
        'target="_blank"'
      )}>`;
    } else {
      return `<a${attrs} target="_blank">`;
    }
  });
}

export function containsArticleNums(article) {
  const containsNumberRegex = /\d+/;

  return (
    containsNumberRegex.test(article.title) ||
    containsNumberRegex.test(article.lead) ||
    containsNumberRegex.test(article.content)
  );
}

export function checkVersionName(version) {
  const validVersions = [
    "softer",
    "softerShort",
    "softerShortest",
    "softerNums",
    "softerShortNums",
    "softerShortestNums",
    "verySoft",
    "verySoftShort",
    "verySoftShortest",
    "verySoftNums",
    "verySoftShortNums",
    "verySoftShortestNums",
    "original",
    "originalShort",
    "originalShortest",
  ];
  return validVersions.includes(version);
}

export function countWords(s){
  s = s.replace(/<[^>]*>/g, ""); // remove HTML tags
    s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
    s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
    return s.split(' ').filter(function(str){return str!="";}).length;
    //return s.split(' ').filter(String).length; - this can also be used
}
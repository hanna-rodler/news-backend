import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

export function markQuotes(text) {
    return text.replace(/„.*?“|„.*?“.?/g, match => `[Q]${match}[/Q]`)
    .replace(/".*?"|".*?".?/g, match => `[Q]${match}[/Q]`);
}

export function cleanContent(text) {
    const cleanedText = text
    .replace(/<div class="story-banner story-horizontal-ad"[\s\S]*?<\/div>/g, '')
    // Remove adworx information and its children
    .replace(/<div class="adworx-wrapper"[\s\S]*?<\/div>/g, '')
    .replace(/<div id="adworx-content"[\s\S]*?<\/div>/g, '')
    .replace(/<aside class="linkcard"[\s\S]*?<\/aside>/g, '')
    .replace(/\n+/g, '')
    .trim();

    const articleAndFigures = extractFiguresAndReplace(cleanedText);
    return {
        cleanedText: articleAndFigures.updatedText.trim(),
        figures: articleAndFigures.figures
    }
}

function extractFiguresAndReplace(text) {
    const figures = [];
  
  // Regex to match <figure>...</figure> elements
  const figureRegex = /<figure[\s\S]*?<\/figure>/g;

  // Replace <figure> elements with <<fig>> and extract their content
  const updatedText = text.replace(figureRegex, (match) => {
    figures.push(match.trim()); // Save the <figure> content
    return '<<fig>>';    // Replace with <<fig>>
  });

  return { updatedText, figures };
}


export function getFormattedDateTime() {
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, '0'); // Pads single digits with a leading zero

  const year = now.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = pad(now.getMonth() + 1); // Months are 0-based
  const date = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `${year}-${month}-${date}_${hours}-${minutes}`;
};

export function saveToFile(content, folder, fileName) {
  const dirPath = path.join(__dirname, folder); 
  const filePath = path.join(dirPath, fileName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write content to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`File written: ${filePath}`);
}
export function markQuotes(text) {
    return text.replace(/„.*?“|„.*?“.?/g, match => `[Q]${match}[/Q]`)
    .replace(/".*?"|".*?".?/g, match => `[Q]${match}[/Q]`);
}

export function cleanContent(text) {
    const cleanedText = text
    .replace(/<div class="story-banner story-horizontal-ad"[\s\S]*?<\/div>/g, '') // Remove adworx information and its children
    .replace(/<div class="adworx-wrapper"[\s\S]*?<\/div>/g, '') // Remove adworx information and its children
    .replace(/<aside class="linkcard"[\s\S]*?<\/aside>/g, '')
    .replace(/\n+/g, '')
    .trim();

    const articleAndFigures = extractFiguresAndReplace(cleanedText);
    return {
        cleanedText: articleAndFigures.updatedText,
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

  console.log('figures', figures);

  return { updatedText, figures };
}
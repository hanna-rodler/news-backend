const verySoftPrompt =
  "You are professional German journalist. Reframe and summarize this German news story with a more sensitive perspective, softening harsh language while ensuring all factual content remains. Your audience are people who are stressed, feel sad and anxious.";

const softerPrompt =
  "You are professional German journalist. You excel at rewriting German articles for adults into child-friendly versions. Transform this news story into a child-friendly version while maintaining adult vocabulary. Your target group are German 12 to 16 year olds that have high German text comprehesion skills. Ensure factual correctness. ";

const input_format_with_lead =
  'The article is provided in the json object article with the keys "title", "lead" and "content". ';
const input_format_without_lead =
  'The article is provided in the json object article with the keys "title" and "content". ';

const return_format_lead = `Return only the rewritten german article in a json_object with the keys "title", "lead" and "content". `;
const return_format = `Return only the rewritten german article in a json_object with the keys "title" and "content". `;

const restriction_political_softer =
  " Ensure that the political or ideological descriptors are retained while still focusing on a softer approach. ";

const summarization_shorter_original =
  "Your task is to generate a short german summary of a german news article. Focus on factual correctness. Summarize the german article below, delimited by triple backticks in at most 100 words.";

const summarization_shortest_original =
  "Your task is to generate a short german summary of a german news article. Focus on factual correctness. Summarize the german article below, delimited by triple backticks in at most 50 words.";

const rewrite_numbers_softest = `You are professional German journalist. Your audience are German people who are stressed, feel sad and anxious. Ensure factual correctness. Look up the definition of casuality numbers. Identify if there are casuality numbers in the article.`;

const rewrite_numbers_softer =
  "You are professional German journalist. Your target group are German 12 to 16 year olds that have high German text comprehesion skills. Ensure factual correctness. Look up the definition of casuality numbers. Identify if there are casuality numbers in the article.";

const numbers_return_and_input_statement_lead =
  'The article is provided in the json object article with the keys "title", "lead" and "content". If there are casuality numbers, modify all of them with fitting categorizations like "mehrere", "ein paar", "einige", "viele", and so on and return the german article in a json_object with the keys "title", "lead" and "content". If there are no casuality numbers present, return `{ hasCasualityNumbers: false}`.';

const numbers_return_and_input_statement =
  'The article is provided in the json object article with the keys "title", "lead" and "content". If there are casuality numbers, modify all of them with fitting categorizations like "mehrere", "ein paar", "einige", "viele", and so on and return the german article in a json_object with the keys "title", "lead" and "content". If there are no casuality numbers present, return `{ hasCasualityNumbers: false}`.';

function getFormatInstructionWithArticle(article) {
  if (article.lead && article.lead !== "" && article.lead !== null) {
    const articleWithLead = {
      title: article.title,
      lead: article.lead,
      content: article.content,
    };
    return (
      input_format_with_lead +
      return_format_lead +
      "\nArticle = " +
      JSON.stringify(articleWithLead)
    );
  } else {
    const articleWithoutLead = {
      title: article.title,
      content: article.content,
    };

    return (
      input_format_without_lead +
      return_format +
      "\nArticle = " +
      JSON.stringify(articleWithoutLead)
    );
  }
}

function getFormatInstructionWithArticleNumbersRewrite(article) {
  const baseArticle = {
    title: article.title,
    content: article.content,
  };

  const articleWithLead =
    article.lead && article.lead !== "" && article.lead !== null
      ? { ...baseArticle, lead: article.lead }
      : baseArticle;

  console.log("get lead instruction? ", articleWithLead.hasOwnProperty("lead"));
  const instruction = articleWithLead.hasOwnProperty("lead")
    ? numbers_return_and_input_statement_lead
    : numbers_return_and_input_statement;

  return `${instruction}\nArticle = ${JSON.stringify(articleWithLead)}`;
}

export function getPrompt(promptType, article) {
  let prompt;
  switch (promptType) {
    case "softer":
      prompt =
        softerPrompt +
        restriction_political_softer +
        getFormatInstructionWithArticle(article);
      break;
    case "verySoft":
      prompt =
        verySoftPrompt +
        restriction_political_softer +
        getFormatInstructionWithArticle(article);
      break;
    case "softerNums":
      prompt =
        rewrite_numbers_softer +
        getFormatInstructionWithArticleNumbersRewrite(article);
      break;
    case "verySoftNums":
      prompt =
        rewrite_numbers_softest +
        getFormatInstructionWithArticleNumbersRewrite(article);
      break;
    default:
      throw new Error("Invalid prompt type");
  }
  console.log("prompt: ", prompt);
  return prompt;
}

export function getSummarizationPrompt(article, isVeryShort = false) {
  console.log("get summarization prompt");
  const summarizationPrompt = isVeryShort
    ? summarization_shortest_original
    : summarization_shorter_original;

  const finalPrompt =
    summarizationPrompt + getFormatInstructionWithArticle(article);

  console.log("final prompt", finalPrompt);
  return finalPrompt;
}

export function checkValidity(article) {
  return (
    article !== null &&
    article.title.length > 3 &&
    article.content.length > 10 &&
    article.id !== undefined
  );
}

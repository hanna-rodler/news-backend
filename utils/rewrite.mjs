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
  " Ensure that the political or ideological descriptors are retained while still focusing on a softer approach.";

const summarization_shorter =
  "Your task is to generate a short german summary of a german news article. Focus on factual correctness. Summarize the german article below, delimited by triple backticks in at most 100 words.";

const summarization_veryShort =
  "Your task is to generate a short german summary of a german news article. Focus on factual correctness. Summarize the german article below, delimited by triple backticks in at most 60 words.";

function getFormatInstructionWithArticle(article) {
  if (article.lead !== "" && article.lead !== null) {
    const articleWithLead = {
      title: article.title,
      lead: article.lead,
      content: article.content,
    };
    return (
      input_format_with_lead +
      return_format_lead +
      "Article = " +
      JSON.stringify(articleWithLead)
    );
  } else {
    const articleWithoutLead = {
      title: article.title,
      content: article.content,
    };
    console.log("articleWithoutLead", articleWithoutLead);

    return (
      input_format_without_lead +
      return_format +
      "Article = " +
      JSON.stringify(articleWithoutLead)
    );
  }
}

// prompt types: softer, verySoft, softerShort, verySoftShort, originalShort, originalLong
export function getPrompt(promptType, article) {
  let prompt;
  switch (promptType) {
    case "softer":
      prompt = softerPrompt;
      break;
    case "verySoft":
      prompt = verySoftPrompt;
      break;
    case "softerShort":
      prompt = undefined;
      break;
    case "verySoftShort":
      prompt = undefined;
      break;
    case "originalShort":
      prompt = undefined;
      break;
    case "originalLong":
      prompt = undefined;
      break;
    default:
      throw new Error("Invalid prompt type");
  }

  const finalPrompt =
    prompt +
    getFormatInstructionWithArticle(article) +
    restriction_political_softer;

  return finalPrompt;
}

export function getSummarizationPrompt(article, isVeryShort = false) {
  const summarizationPrompt = isVeryShort
    ? summarization_veryShort
    : summarization_shorter;

  const finalPrompt =
    summarizationPrompt + getFormatInstructionWithArticle(article);

  return finalPrompt;
}

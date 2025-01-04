import { prompt1_s, prompt2_s, prompt3_s, prompt4_s, prompt5_s, prompt6_s, prompt7_s, prompt8_s, prompt9_s, prompt10_s, prompt11_s } from './../prompts/softer.mjs';
import { prompt1_vs, prompt2_vs, prompt3_vs, prompt4_vs, prompt5_vs, prompt6_vs, prompt7_vs } from './../prompts/verySoft.mjs';
import { article_3377004, article_3378675, article_3378969, article_3378984, article_3379013 } from '../articles/testingSample.mjs';

const softerPrompts = {
  prompt1_s,
  prompt2_s,
  prompt3_s,
  prompt4_s,
  prompt5_s,
  prompt6_s,
  prompt7_s,
  prompt8_s,
  prompt9_s,
  prompt10_s,
  prompt11_s
}

const verySoftPrompts = {
  prompt1_vs,
  prompt2_vs,
  prompt3_vs,
  prompt4_vs,
  prompt5_vs,
  prompt6_vs,
  prompt7_vs
}

const articles = {
  article_3377004,
  article_3378984,
  article_3378675,
  article_3379013,
  article_3378969
}

const input_format_with_lead = 'The article is provided in the json object article with the keys "title", "lead" and "content". ';
const input_format_without_lead = 'The article is provided in the json object article with the keys "title" and "content". ';

const return_format = 'Return the rewritten article in a json_object. ';

const restriction_political_softer = "Ensure that the political or ideological descriptors are retained while still focusing on a softer approach."

const restriction_political_very_soft = "Ensure that the political or ideological descriptors are retained while still focusing on a softer approach to avoid triggering stress or anxiety."

export function getFormatInstructionWithArticle(article) {
    if(article.lead !== '' && article.lead !== null) {
        const articleWithLead = {
          title: article.title,
          lead: article.lead,
          content: article.content
        }
        return input_format_with_lead + return_format + "Article = " + JSON.stringify(articleWithLead);
      } else {
        const articleWithoutLead = {
          title: article.title,
          content: article.content,
        };
    
        return input_format_without_lead + return_format + "Article = " + JSON.stringify(articleWithoutLead)
      }
}

export function getPoliticalRestrictionInstruction(promptName) {
  let promptVersion = promptName.split("_")[1];
  if(promptVersion === 's') {
    return restriction_political_softer;
  } else {
    return restriction_political_very_soft;
  }
}

export function getSofterPrompt(promptName) {
    return softerPrompts[promptName]
}

export function getVerySoftPrompt(promptName) {
    return verySoftPrompts[promptName]
}

export function isPromptNameValid(promptName) {
  return Object.keys(softerPrompts).includes(promptName) || Object.keys(verySoftPrompts).includes(promptName);
}


export function getArticle(articleId) {
  return articles[`article_${articleId}`];
}
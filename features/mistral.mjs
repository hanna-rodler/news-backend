import { Mistral } from "@mistralai/mistralai";
import dotenv from 'dotenv';
import { getFormatInstructionWithArticle, getSofterPrompt, getPoliticalRestrictionInstruction } from "../utils/mistral.mjs";
dotenv.config();
const apiKey = process.env.MISTRAL_API_KEY;

export async function getPrompt(promptName, temp, article) {
  const userPrompt = getSofterPrompt(promptName) + getFormatInstructionWithArticle(article) + getPoliticalRestrictionInstruction(promptName);
  console.log('user Prompt', promptName);

  const client = new Mistral({ apiKey: apiKey });

  const chatResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "user", content: userPrompt },
    ],
    temperature: Number(temp),
    random_seed: 1698341829,
    responseFormat: {
      type: "json_object",
    },
    n: 3,
    safe_prompt: false
  });

  let rewrittenText = [];

  // console.log("Chat:", chatResponse.choices);
  rewrittenText[0] = JSON.parse(chatResponse.choices[0].message.content);
  rewrittenText[1] = JSON.parse(chatResponse.choices[1].message.content);
  rewrittenText[2] = JSON.parse(chatResponse.choices[2].message.content);
  return rewrittenText;
}

export async function getPrompt9c(temp, article, lead, title) {
  // 9c
  const persona_9c =
    "You are a professional german journalist. You excel at rewriting articles while maintaining factual correctness. ";
  const audience_9c =
    "Your target group are german children who are stressed, anxious or tired. ";
  const instruction_9c =
    "Modify the languge in Modify the languge in the news article to reduce alarming or sensational terms. Avoid describing violent details like how many people died.";

  const tone_9c =
    "Your tone should be very softening, professional, clear and calming. ";

  // const restrictions = "Do not add any aditional interpretation like how important the topic is, unless the article states that."

  const restrictions = "Do not write things like \"important topic\" unless the article directly says that";
  // const restrictions =
  //   "Ensure that all direct quotes are preserved exactly as they are. Do not alter the words within the quotes. Use the following format to mark the quotes: [Q]...[/Q]."; 

  let format;
  let userText;

  if(lead !== '') {
    const articleWithLead = {
      title: title,
      lead: lead,
      content: article,
    };

    format =  "Return the rewritten article in a json_object with they keys 'title', 'lead' and 'content'. "

    userText = "The article title is provided in the json with the key 'title'. The article lead is provided in the json with the key 'lead'. The article body is provided in the json with the key 'content'." +
        JSON.stringify(articleWithLead);
  } else {
    const articleWithoutLead = {
      title: title,
      content: article,
    };

    format = "Return the rewritten article in a json_object with they keys 'title' and 'content'. "

    userText =  "The article title is provided in the json with the key 'title'. The article body is provided in the json with the key 'content'." +
    JSON.stringify(articleWithoutLead)
  }

  const systemMessage_9c =
  persona_9c + audience_9c + instruction_9c + tone_9c + format + userText;

  console.log("system Message", systemMessage_9c);
  console.log("user message", userText);

  const client = new Mistral({ apiKey: apiKey });

  // const chatResponse = await client.chat.complete({
  //   model: "mistral-large-latest",
  //   messages: [
  //     { role: "system", content: systemMessage_9c },
  //     { role: "user", content: userText },
  //   ],
  //   // temperature: 0.3, // for prompt 9c
  //   // temperature: 0.1, // tried for 7b along with 0.3, 0.5 and 0.7 but only almost same output achieved
  //   // topP: 0.7,
  //   temperature: Number(temp),
  //   responseFormat: {
  //     type: "json_object",
  //   },
  // });
  const chatResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "user", content: systemMessage_9c },
    ],
    temperature: Number(temp),
    random_seed: 1698341829,
    responseFormat: {
      type: "json_object",
    },
    n: 2,
    safe_prompt: false
  });

  let rewrittenText = [];

  console.log("Chat:", chatResponse.choices);
  rewrittenText[0] = chatResponse.choices[0].message.content.replaceAll(
    /\[Q\]|\[\/Q\]/g,
    ""
  );
  rewrittenText[1] = chatResponse.choices[1].message.content.replaceAll(
    /\[Q\]|\[\/Q\]/g,
    ""
  );
  return rewrittenText;
};

export async function getPrompt7b(temp, title, lead, article) {
  

  const restrictions =
    "Ensure that all direct quotes are preserved exactly as they are. Do not alter the words within the quotes. Use the following format to mark the quotes: [Q]...[/Q]. "; // Keep the main topic of the article, even if it may be emotionally distressing. // you are forbidden to change any form of direct speech delimited by \\"   // Do not change direct speech delimited by \\"
  // Do not write things like "important topic" unless the article directly says that.
  let format;
  let userText;

  if(lead !== '') {
    const articleWithLead = {
      title: title,
      lead: lead,
      content: article,
    };

    format =  "Return the rewritten article in a json_object with they keys 'title', 'lead' and 'content'. "

    userText = "The article title is provided in the json object article with the key 'title'. The article lead is provided in the json object with the key 'lead'. The article body is provided in the json object with the key 'content'." +
        JSON.stringify(articleWithLead);
  } else {
    const articleWithoutLead = {
      title: title,
      content: article,
    };

    format = "Return the rewritten article in a json_object with they keys 'title' and 'content'. "

    userText =  "The article title is provided in the json with the key 'title'. The article body is provided in the json with the key 'content'." +
    JSON.stringify(articleWithoutLead)
  }

  // 7b
  const persona_7b =
    "You are professional german journalist. You excel at rewriting german articles while maintaining factual correctness. ";
  const audience_7b =
    "Your target group are german people who are stressed, anxious or tired. ";
  const instruction_7b =
    "Modify the languge in the news article to reduce alarming or sensational terms. ";
  const tone_7b = "Your tone should be softening, professional and clear. ";

  const systemMessage_7b =
    persona_7b + instruction_7b + audience_7b + tone_7b + format + userText;

  console.log("system Message", systemMessage_7b);

  const client = new Mistral({ apiKey: apiKey });

  const chatResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "user", content: systemMessage_7b },
    ],
    temperature: Number(temp),
    random_seed: 1456,
    responseFormat: {
      type: "json_object",
    },
    n: 2,
  });

  let rewrittenText = [];

  console.log("Chat:", chatResponse.choices);
  rewrittenText[0] = chatResponse.choices[0].message.content.replaceAll(
    /\[Q\]|\[\/Q\]/g,
    ""
  );
  rewrittenText[1] = chatResponse.choices[1].message.content.replaceAll(
    /\[Q\]|\[\/Q\]/g,
    ""
  );
  return rewrittenText;
};

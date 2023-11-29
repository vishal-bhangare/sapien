"use server";
import OpenAI from "openai";
const APIKEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: APIKEY,
});

export default async function openaiClient(query: string) {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: query }],
    model: "gpt-3.5-turbo",
  });
  console.log(response);
  return JSON.stringify(response.choices[0]!.message!.content);
}

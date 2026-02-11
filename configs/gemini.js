import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();

export const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite", 
  temperature: 0.3
});
import dotenv from "dotenv";
import { FaissStore } from "langchain/vectorstores/faiss";
import { Document } from "langchain/document";
import { genAI } from "../server.js";
import { generatePrompt } from "./generatePromt.js";
dotenv.config();

export default async function getAIResponseFromFaiss(
  vectordb,
  query,
  url,
  key
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const retriever = vectordb.asRetriever({
      searchKwargs: { fetchK: 10 },
    });

    const relevantDocs = await retriever.getRelevantDocuments(query);

    const context = relevantDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");
    const prompt = generatePrompt(query, url, key, context);

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Error in getting AI Response: " + errorMessage);
  }
}


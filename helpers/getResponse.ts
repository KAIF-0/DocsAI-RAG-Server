import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
dotenv.config();

//google genAI config
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export default async function getAIResponseFromFaiss(
  vectordb: FaissStore,
  query: string,
  url: string,
  key: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const retriever = vectordb.asRetriever({
      searchKwargs: { fetchK: 5 },
    });

    const relevantDocs = await retriever.getRelevantDocuments(query);

    //answer from general knowledge if no relevant docss found
    if (!relevantDocs.length) {
      console.log("----Answering from general knowledge----");
      const result = await model.generateContent(query);
      return result.response.text();
    }

    const context = relevantDocs
      .map((doc: Document) => doc.pageContent)
      .join("\n\n");
    const prompt = `This is my documentation site URL: ${url} and its name: ${key}. Please answer the question: "${query}". 

    - If the question is related to the site URL or its name, provide the best possible answer using the context below.
    - If the context does not contain enough information, use general knowledge to answer.
    - If the question is not related to the documentation site, respond with: "Sorry, I cannot answer non related questions!"
    
    Context:
    ${context}
    
    Question:
    ${query}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Error in getting AI Response: " + errorMessage);
  }
}

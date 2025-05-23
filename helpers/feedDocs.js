import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export default async function feedDocumentsToFaiss(docs) {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(docs);
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "models/embedding-001",
    });

    return await FaissStore.fromTexts(chunks, [], embeddings);
  } catch (error) {
    throw new Error("Error in feedDocumentsToFaiss: " + error);
  }
}

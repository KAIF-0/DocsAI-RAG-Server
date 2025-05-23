import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export default async function feedDocumentsToFaiss(
  docs: string
): Promise<FaissStore> {
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Error in feedDocumentsToFaiss: " + errorMessage);
  }
}

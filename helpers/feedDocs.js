import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { index } from "../configs/vector.js";

const BATCH_SIZE = 500;

export default async function feedDocumentsToFaiss(docs, key) {
  try {
    await cleanIndex(key);
    const json = JSON.parse(docs);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = [];

    for (const data of json) {
      if (!data?.url || !data?.content) continue;

      //making exactly 5 chunks for every page
      const splits = await splitter.splitText(data.content);

      const chunkCount = 5;
      const chunkSize = Math.ceil(splits.length / chunkCount);

      const finalChunks = Array.from({ length: chunkCount }, (_, i) =>
        splits.slice(i * chunkSize, (i + 1) * chunkSize).join(" ")
      ).filter((chunk) => chunk.trim().length > 0);

      finalChunks.forEach((chunk, index) => {
        chunkedDocs.push({
          id: `${data.url}#${index}`,
          data: chunk,
        });
      });
    }

    //fix: batch size error
    for (let i = 0; i < chunkedDocs.length; i += BATCH_SIZE) {
      const batch = chunkedDocs.slice(i, i + BATCH_SIZE);
      await index.upsert(batch, { namespace: key });
    }

    console.log("Documents indexed successfully!");

    return {
      success: true,
      message: "Documents indexed successfully!",
    };
  } catch (error) {
    throw new Error("Error in Indexing: " + error.message);
  }
}

async function cleanIndex(key) {
  try {
    const res = await index.deleteNamespace(key);

    console.log(`Namespace "${key}" deleted. Success: ${res}`);
  } catch (err) {
    console.error(`Error deleting namespace:`, err.message);
  }
}

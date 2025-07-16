import { genAI } from "../server.js";
import { generatePrompt } from "./generatePromt.js";
import { index } from "../configs/vector.js";

export default async function getAIResponseFromVectorStore(query, url, key) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const retrievedData = await index.query(
      {
        data: query,
        topK: 2,
        includeData: true,
      },
      {
        namespace: key,
      }
    );

    const context = retrievedData.map((data) => data.data);
    // console.log(retrievedData);
    const prompt = generatePrompt(query, url, key, context);

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw new Error("Error in getting AI Response: " + error);
  }
}

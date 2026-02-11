import { index } from "../../configs/vector.js";

export const retrieveNode = async (state) => {
  const { question, key } = state;

  try {
    const queryOptions = {
      data: question,
      topK: 2,
      includeData: true,
    };

    const result = await index.query(queryOptions, { namespace: key });
    
    // Original logic mapped data.data
    const context = result.map(match => match.data).join("\n\n");
    return { context };

  } catch (error) {
    console.error("Retrieval error:", error);
    return { context: "" };
  }
};

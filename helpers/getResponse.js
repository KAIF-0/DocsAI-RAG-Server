import { graph } from "../agent/graph.js";

export default async function getAIResponse(query, url, key) {
  try {
      const result = await graph.invoke({
        question: query,
        key: key,
        url: url, 
      });
      
      return result.answer;
    } catch (error) {
      console.error("Agent invocation failed:", error);
      return "Sorry, something went wrong while processing your request.";
    }
}

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../configs/gemini.js";


export const validateNode = async (state) => {
  const { question, key } = state;

  const systemPrompt = `You are a strict technical content validator for documentation about "${key}".
  
Classify the USER QUESTION into one of these three categories:
1. "technical_doc_related": The question is technical AND likely related to ${key}, its APIs, usage, or specific domain.
2. "technical_general": The question is about general programming, software, or hardware but NOT specific to ${key}.
3. "non_technical": The question is personal, political, conversation, or otherwise non-technical.

Return JSON ONLY: { "classification": "technical_doc_related" | "technical_general" | "non_technical" }`;

  try {
    const result = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(question)
    ]);
    
    // Clean potential markdown formatting from JSON response
    const content = result.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(content);
    return { classification: parsed.classification };

  } catch (error) {
    console.error("Validation error:", error);
    // Fallback on error - default to attempting retrieval if unsure
    return { classification: "technical_doc_related" }; 
  }
};

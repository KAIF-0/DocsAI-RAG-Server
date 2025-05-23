export const generatePrompt = (query, url, key, context = "") => {
  return context !== ""
    ? `This is my documentation site URL: ${url} and its name: ${key}. Please answer the question: "${query}". 

    - If the question is related to the site URL or its name, provide the best possible answer using the context below.
    - If the context does not contain enough information or empty, use general knowledge to answer in best possible way.
    - If the question is not related to the documentation site, respond with: "Sorry, I cannot answer non related questions!"
    
    Context:
    ${context}
    `
    : `This is my documentation site url: ${url} and it's name: ${key}, please answer the question: "${query}". If the question is related to the site url and it's name then provide the best response you can otherwise response with that "Sorry, I cannot answer non related questions!";`;
};

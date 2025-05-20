from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.exception import AppwriteException
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv
import os
import json

# Load environment variables from .env file
load_dotenv()

# Set your Google API key here
# os.environ["GOOGLE_API_KEY"] = "AIzaSyCFbB1b_OcOBF4ghDs-xepojnV7f1pc_bg"  # Replace with your actual API key

def main(context):
    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        .set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        .set_key(context.req.headers["x-appwrite-key"])
    )
    users = Users(client)

    try:
        response = users.list()
        context.log("Total users: " + str(response["total"]))
    except AppwriteException as err:
        context.error("Could not list users: " + repr(err))

    # post request for AI responses
    if context.req.method == "POST" and context.req.path == "/get-response":
        print("Received POST request")
        print(f"Request data type: {type(context.req.data)}")
        print(f"Request data: {context.req.data}")
        
        data = context.req.data
        if isinstance(data, str):
            json_data = json.loads(data)
        else:
            json_data = data
            
        print(f"JSON data type: {type(json_data)}")
        print(f"JSON data: {json_data}")
        
        query = json_data["query"]
        print(f"Query: {query}")
        
        docs = json_data["docs"]
        print(f"Docs type: {type(docs)}")
        print(f"Docs: {docs}")
        
        vectordb = feed_documents_to_faiss(docs)
        response = get_ai_response_from_faiss(vectordb, query)
        return context.res.json({"response": response})

    return context.res.json(
        {
            "response": " Hello from RAG Appwrite Functions!",
        }
    )


def feed_documents_to_faiss(docs):
    if isinstance(docs, str):
        docs = [Document(page_content=docs)]
    
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(docs)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectordb = FAISS.from_documents(chunks, embedding=embeddings)
    
    return vectordb



def get_ai_response_from_faiss(vectordb, query):
    retriever = vectordb.as_retriever(search_kwargs={"k": 5, "score_threshold": 0.5})
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)

    relevant_docs = retriever.invoke(query)
    if not relevant_docs:
        return llm.invoke(query).content

    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    prompt = f"""
    Based on the following context, answer the question below. 
    If the context lacks relevant information, answer from general knowledge.

    Context:
    {context}

    Question: {query}
    """
    response = llm.invoke(prompt)
    return response.content

# def test():
    
#     vectordb = feed_documents_to_faiss("AI embeddings are numerical representations of data—typically text, images, or other complex objects—converted into high-dimensional vectors. These vectors capture the semantic meaning or context of the data in a way that machines can process. Here's a concise breakdown:What They Are: Embeddings are dense vectors (e.g., [0.23, -0.15, 0.67, ...]) where each dimension represents a learned feature of the data. For text, they encode semantic relationships, so similar concepts (e.g., dog and puppy) have similar vectors.How They're Created: AI models, like Google's embedding-001 or OpenAI's text-embedding models, are trained on large datasets to map data to vectors. These models learn patterns (e.g., word relationships) during training, often using neural networks")
#     print("Feeding documents to FAISS completed.")
#     response = get_ai_response_from_faiss(vectordb, "How AI embeddings are created?")
#     print(response)

# test()   
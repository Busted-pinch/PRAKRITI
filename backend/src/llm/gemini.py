import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

def get_gemini_llm(model_name: str = "gemini-2.5-flash-lite", temperature: float = 1.0):
    """
    Returns an instance of ChatGoogleGenerativeAI.
    
    Args:
        model_name: The name of the Gemini model to use (default: gemini-pro).
        temperature: Controls randomness (0.0 to 1.0).
        
    Returns:
        ChatGoogleGenerativeAI instance or None if API key is missing.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("WARNING: GOOGLE_API_KEY not found in environment variables.")
        # raise ValueError("GOOGLE_API_KEY is not set")
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            max_tokens=2048,
            timeout=None,
            max_retries=3,
            vertexai=None
        )
        return llm
    except Exception as e:
        print(f"Error initializing Gemini LLM: {e}")
        return None

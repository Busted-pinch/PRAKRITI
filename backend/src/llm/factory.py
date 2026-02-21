import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

def get_llm(provider: str = "groq", model_name: str = None, temperature: float = 0.7):
    """
    Returns an instance of an LLM based on the requested provider.
    Defaults to Groq if available.
    """
    if provider in ["grok", "groq"]:
        # The user mentioned setting GROK_API_KEY, so check both
        api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
        if not api_key:
            print("WARNING: GROQ_API_KEY not found in environment variables. Falling back to Gemini.")
            return get_llm(provider="gemini", model_name=model_name, temperature=temperature)
            
        return ChatGroq(
            api_key=api_key,
            model_name=model_name or "llama-3.3-70b-versatile",
            temperature=temperature,
            max_tokens=2048,
            max_retries=3
        )
        
    elif provider == "gemini":
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("WARNING: GOOGLE_API_KEY not found in environment variables.")
            return None
            
        return ChatGoogleGenerativeAI(
            model=model_name or "gemini-2.5-flash-lite",
            temperature=temperature,
            max_tokens=2048,
            timeout=None,
            max_retries=3,
            vertexai=None
        )
        
    print(f"ERROR: Unknown LLM provider '{provider}'")
    return None

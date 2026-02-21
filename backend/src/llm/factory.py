import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

def get_llm(provider: str = "groq", model_name: str = None, temperature: float = 0.7):
    """
    Returns an LLM instance based on the requested provider.

    Providers:
    - "grok"  → xAI Grok (GROK_API_KEY, OpenAI-compatible endpoint)
    - "groq"  → Groq Cloud (GROQ_API_KEY, ChatGroq)
    - "gemini"→ Google Gemini (GOOGLE_API_KEY)
    """
    if provider == "grok":
        api_key = os.getenv("GROK_API_KEY")
        if not api_key:
            print("WARNING: GROK_API_KEY not found. Falling back to Gemini.")
            return get_llm(provider="gemini", model_name=model_name, temperature=temperature)
        # xAI is fully OpenAI-compatible — use langchain_openai with custom base_url
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                api_key=api_key,
                base_url="https://api.x.ai/v1",
                model=model_name or "grok-2-1212",
                temperature=temperature,
                max_tokens=512,
                max_retries=3,
            )
        except ImportError:
            print("WARNING: langchain_openai not installed. Falling back to Gemini.")
            return get_llm(provider="gemini", model_name=model_name, temperature=temperature)

    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("WARNING: GROQ_API_KEY not found. Falling back to Gemini.")
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

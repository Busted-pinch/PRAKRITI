import asyncio
import sys
import os

# Ensure src is in python path
sys.path.append(os.path.join(os.getcwd(), "src"))

from src.langgraph.graph import app
from langchain_core.messages import HumanMessage

async def main():
    print("--- Starting Verification ---")
    
    # Test 1: General Chat
    print("\nTest 1: General Chat (Expect Chatbot)")
    try:
        res = await app.ainvoke({"messages": [HumanMessage(content="Hello, who are you?")]})
        print(f"Final State Next Agent: {res.get('next_agent')}")
        print(f"Response: {res['messages'][-1].content}")
    except Exception as e:
        print(f"Test 1 Failed: {e}")
    
    # Test 2: Environment
    print("\nTest 2: Environment Query (Expect Environment Analyst)")
    try:
        res = await app.ainvoke({"messages": [HumanMessage(content="What is the weather in New York?")]})
        print(f"Final State Next Agent: {res.get('next_agent')}")
        print(f"Response: {res['messages'][-1].content}")
        # print(f"Structured Data: {res.get('structured_data')}")
    except Exception as e:
        print(f"Test 2 Failed: {e}")

    # Test 3: Simulation
    print("\nTest 3: Simulation (Expect Digital Twin)")
    try:
        res = await app.ainvoke({"messages": [HumanMessage(content="Run a prediction for traffic reduction.")]})
        print(f"Final State Next Agent: {res.get('next_agent')}")
        print(f"Response: {res['messages'][-1].content}")
    except Exception as e:
        print(f"Test 3 Failed: {e}")
    
    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    # Ensure Windows compatibility for asyncio loop policy if needed
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

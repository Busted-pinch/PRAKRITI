import os
import requests
from typing import List, Dict

class TavilyService:
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")

    def search_news(self, query: str = None, location_focus: str = "global", max_results: int = 10) -> List[Dict]:
        """
        Searches Tavily for the latest news based on a query or location focus.
        """
        extracted_news = []
        
        # Build query based on location focus if no explicit query is provided
        if query is None:
            if location_focus.lower() == "global":
                query = "latest global environmental news climate pollution sustainability law policy"
            else:
                query = f"latest environmental news climate pollution sustainability law policy in {location_focus} city"
        
        if not self.api_key:
            print(f"WARNING: TAVILY_API_KEY not found. Using mock raw news data for {location_focus}.")
            extracted_news = [
                {
                    "title": f"Environmental Initiatives Launch in {location_focus.capitalize()}",
                    "content": f"Local authorities in {location_focus.capitalize()} have announced new measures to combat climate change.",
                    "source": f"{location_focus.capitalize()} Daily",
                    "published_at": "2024-11-25T10:00:00Z"
                }, 
                {
                    "title": "Global Plastic Treaty Talks Resume in Busan",
                    "content": "Delegates from over 170 nations have gathered in Busan, South Korea, to negotiate what could become the world's first legally binding treaty on plastic pollution. The talks aim to address the full lifecycle of plastics, from production to disposal.",
                    "source": "Global Environment News",
                    "published_at": "2024-11-25T10:00:00Z"
                },
                {
                    "title": "New Delhi Implements Severe Air Quality Measures",
                    "content": "As the Air Quality Index (AQI) soared past 450, categorized as 'severe plus', authorities in New Delhi have enacted emergency measures. Primary schools have transitioned to online classes, and restrictions on diesel vehicles and construction activities have been enforced.",
                    "source": "Asia Climate Watch",
                    "published_at": "2024-11-24T08:30:00Z"
                }
            ]
            return extracted_news

        try:
            url = "https://api.tavily.com/search"
            payload = {
                "api_key": self.api_key,
                "query": query,
                "search_depth": "basic",
                "include_answer": False,
                "include_images": False,
                "include_raw_content": False,
                "max_results": max_results,
            }
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            for result in data.get("results", []):
                extracted_news.append({
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "source": result.get("url", "Tavily Search")
                })
        except Exception as e:
            print(f"Error fetching news from Tavily: {e}")
            
        return extracted_news

tavily_service = TavilyService()

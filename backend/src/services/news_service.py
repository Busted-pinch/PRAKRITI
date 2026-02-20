import os
import requests
from typing import List, Dict
import time

# Simple in-memory cache to replace Redis for local testing
_NEWS_CACHE = {
    "data": None,
    "timestamp": 0
}
CACHE_TTL = 15 * 60  # 15 minutes

class NewsService:
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")

    def fetch_environmental_news(self) -> List[Dict]:
        global _NEWS_CACHE
        current_time = time.time()
        
        if _NEWS_CACHE["data"] and (current_time - _NEWS_CACHE["timestamp"] < CACHE_TTL):
            return _NEWS_CACHE["data"]

        if not self.tavily_api_key:
            # Fallback mock data if no API key is provided
            print("WARNING: TAVILY_API_KEY not found. Using mock news data.")
            mock_news = [
                {
                    "title": "Global Plastic Treaty Talks Resume in Busan",
                    "content": "Delegates from over 170 nations have gathered in Busan, South Korea, to negotiate what could become the world's first legally binding treaty on plastic pollution. The talks aim to address the full lifecycle of plastics, from production to disposal. While environmental groups push for production caps, some nations argue for a focus on recycling and waste management.",
                    "source": "Global Environment News",
                    "published_at": "2024-11-25T10:00:00Z"
                },
                {
                    "title": "New Delhi Implements Severe Air Quality Measures",
                    "content": "As the Air Quality Index (AQI) soared past 450, categorized as 'severe plus', authorities in New Delhi have enacted emergency measures. Primary schools have transitioned to online classes, and restrictions on diesel vehicles and construction activities have been enforced. Doctors are advising vulnerable populations, particularly those with respiratory issues like asthma, to remain indoors.",
                    "source": "Asia Climate Watch",
                    "published_at": "2024-11-24T08:30:00Z"
                },
                {
                    "title": "Breakthrough in Solar Panel Efficiency Reached",
                    "content": "Researchers at a leading European institute have achieved a new world record in solar cell efficiency, reaching 33.5% using a novel tandem perovskite-silicon architecture. This breakthrough promises to significantly reduce the cost of solar energy and accelerate the transition away from fossil fuels, contributing heavily to global net-zero targets.",
                    "source": "Tech & Sustainability Weekly",
                    "published_at": "2024-11-23T14:15:00Z"
                },
                {
                    "title": "Major Ocean Cleanup Initiative Removes 100 Tons of Waste",
                    "content": "A non-profit organization focused on marine conservation announced the successful removal of 100 tons of plastic waste from the Great Pacific Garbage Patch in a single deployment. Using an upgraded extraction system, the team demonstrated the viabilty of large-scale ocean cleanup operations, though experts caution that stopping plastic at the source remains the ultimate solution.",
                    "source": "Oceanic News Network",
                    "published_at": "2024-11-22T09:45:00Z"
                }
            ]
            _NEWS_CACHE["data"] = mock_news
            _NEWS_CACHE["timestamp"] = current_time
            return mock_news

        try:
            # Tavily implementation
            url = "https://api.tavily.com/search"
            payload = {
                "api_key": self.tavily_api_key,
                "query": "latest global environmental news climate pollution sustainability law policy",
                "search_depth": "basic",
                "include_answer": False,
                "include_images": False,
                "include_raw_content": False,
                "max_results": 10,
            }
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            extracted_news = []
            for result in data.get("results", []):
                extracted_news.append({
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "source": result.get("url", "Tavily Search"),
                    "published_at": "Recent"
                })
                
            _NEWS_CACHE["data"] = extracted_news
            _NEWS_CACHE["timestamp"] = current_time
            return extracted_news

        except Exception as e:
            print(f"Error fetching news from Tavily: {e}")
            return []

news_service = NewsService()

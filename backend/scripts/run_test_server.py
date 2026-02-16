import uvicorn
import sys
import os

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.main import app
from src.api.deps import get_current_user

# Override auth dependency to bypass token check
async def mock_get_current_user():
    return {"id": "test_user_123", "email": "test@example.com"}

app.dependency_overrides[get_current_user] = mock_get_current_user

if __name__ == "__main__":
    print("\n🚀 Starting Test Server with Auth Bypassed...")
    print("✅ Authentication is disabled for this session.")
    print("🌍 Endpoint: http://127.0.0.1:8000/environment/current")
    print("---------------------------------------------------------")
    uvicorn.run(app, host="127.0.0.1", port=8000)

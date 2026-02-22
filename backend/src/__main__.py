import uvicorn
import os
from dotenv import load_dotenv
load_dotenv()
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)

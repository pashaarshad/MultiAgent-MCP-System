import httpx
import asyncio
import os

from dotenv import load_dotenv
load_dotenv()

KEY = os.getenv("OPENROUTER_API_KEY", "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")

async def check():
    print(f"Checking key: {KEY[:10]}...")
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://openrouter.ai/api/v1/auth/key", headers={"Authorization": f"Bearer {KEY}"})
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")

if __name__ == "__main__":
    asyncio.run(check())

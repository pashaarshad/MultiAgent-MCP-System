from mcp.server.fastmcp import FastMCP
import httpx
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../../backend/.env'))

# Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
ROUTER_MODEL = "llama3.2:3b" # Small, fast model for classification

# Initialize FastMCP Server
mcp = FastMCP("Router MCP")

async def call_llm(prompt: str, system_prompt: str) -> str:
    """Helper to call LLM (Ollama or OpenRouter)."""
    # Try OpenRouter if key exists (for better JSON adherence)
    if OPENROUTER_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "google/gemini-2.0-flash-exp:free", # Fast and good at JSON
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Router OpenRouter failed: {e}")
    
    # Fallback to Ollama
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": ROUTER_MODEL,
                    "prompt": prompt,
                    "system": system_prompt + " RETURN JSON ONLY.",
                    "stream": False,
                    "format": "json"
                }
            )
            if response.status_code == 200:
                return response.json()["response"]
    except Exception as e:
        print(f"Router Ollama failed: {e}")
        return "{}"

@mcp.tool()
async def route_tasks(specification: str) -> str:
    """
    Analyze a detailed website specification and segregate it into tasks for Code, Image, Video, and Audio agents.
    Returns a JSON string with the tasks.
    """
    system_prompt = """You are a System Architect. Analyze the website specification and break it down into specialized tasks.
    
    Return a JSON object with this EXACT structure:
    {
        "code_task": "Detailed instructions for the coder to build the HTML/CSS/JS structure...",
        "images": [
            {"filename": "hero_bg.jpg", "description": "A futuristic city skyline..."},
            {"filename": "logo.png", "description": "Modern tech logo..."}
        ],
        "videos": [
            {"filename": "intro.mp4", "description": "Explanation of the product..."}
        ],
        "audio": [
            {"filename": "background.mp3", "description": "Ambient electronic music..."}
        ]
    }
    """
    
    response = await call_llm(specification, system_prompt)
    return response

if __name__ == "__main__":
    mcp.run()

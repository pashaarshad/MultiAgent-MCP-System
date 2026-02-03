# Backend API Server
# Multi-Agent MCP System
# Orchestrates all MCP servers and provides REST API for frontend

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
# Load environment variables
load_dotenv()



# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Multi-Agent MCP Backend",
    description="Backend API for the Multi-Agent MCP System - orchestrates NLP, Code, Image, and Video MCP servers",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# CONFIGURATION
# ============================================

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "mistral:7b")
OLLAMA_CODE_MODEL = os.getenv("OLLAMA_CODE_MODEL", "deepseek-coder:6.7b")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
USE_CLOUD_FALLBACK = os.getenv("FALLBACK_TO_CLOUD", "true").lower() == "true"


# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class GenerationRequest(BaseModel):
    """Request to generate a website from a prompt."""
    prompt: str = Field(..., description="User's prompt describing the website")
    project_id: Optional[str] = Field(default=None, description="Optional project ID")
    enhance_prompt: bool = Field(default=True, description="Whether to enhance the prompt first")
    include_images: bool = Field(default=False, description="Whether to generate images")
    single_file: bool = Field(default=True, description="Output as single HTML file")


class GenerationResponse(BaseModel):
    """Response containing generated website code."""
    success: bool
    project_id: str
    html: str
    css: str
    javascript: str
    enhanced_prompt: Optional[str] = None
    images: Optional[List[dict]] = None
    error: Optional[str] = None
    model_used: str = "local"


class ChatMessage(BaseModel):
    """Chat message for iterative refinements."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Request for chat-based code modification."""
    project_id: str
    message: str
    current_html: Optional[str] = None
    current_css: Optional[str] = None
    current_js: Optional[str] = None
    history: Optional[List[ChatMessage]] = []


# ============================================
# HELPER FUNCTIONS
# ============================================

async def call_ollama(prompt: str, model: str, system_prompt: str = "") -> str:
    """Call Ollama local model."""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


async def call_openrouter(prompt: str, model: str, system_prompt: str = "") -> str:
    """Call OpenRouter as fallback."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenRouter error: {str(e)}")


def extract_code_blocks(response: str) -> dict:
    """Extract HTML, CSS, and JavaScript from response."""
    import re
    result = {"html": "", "css": "", "js": ""}
    
    html_match = re.search(r'```html\s*([\s\S]*?)```', response, re.IGNORECASE)
    if html_match:
        result["html"] = html_match.group(1).strip()
    
    css_match = re.search(r'```css\s*([\s\S]*?)```', response, re.IGNORECASE)
    if css_match:
        result["css"] = css_match.group(1).strip()
    
    js_match = re.search(r'```(?:javascript|js)\s*([\s\S]*?)```', response, re.IGNORECASE)
    if js_match:
        result["js"] = js_match.group(1).strip()
    
    if not any(result.values()) and ('<html' in response.lower() or '<!doctype' in response.lower()):
        result["html"] = response.strip()
    
    return result


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Multi-Agent MCP Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate": "POST /api/generate",
            "chat": "POST /api/chat",
            "status": "GET /api/status",
            "health": "GET /api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    ollama_status = "unknown"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_HOST}/api/tags")
            ollama_status = "connected" if response.status_code == 200 else "error"
    except:
        ollama_status = "disconnected"
    
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "cloud_fallback": USE_CLOUD_FALLBACK,
        "openrouter_configured": bool(OPENROUTER_API_KEY)
    }


@app.get("/api/status")
async def get_status():
    """Get detailed system status."""
    ollama_models = []
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_HOST}/api/tags")
            if response.status_code == 200:
                ollama_models = [m["name"] for m in response.json().get("models", [])]
    except:
        pass
    
    return {
        "ollama": {
            "host": OLLAMA_HOST,
            "chat_model": OLLAMA_CHAT_MODEL,
            "code_model": OLLAMA_CODE_MODEL,
            "available_models": ollama_models
        },
        "cloud": {
            "openrouter_configured": bool(OPENROUTER_API_KEY),
            "fallback_enabled": USE_CLOUD_FALLBACK
        }
    }


@app.post("/api/generate", response_model=GenerationResponse)
async def generate_website(request: GenerationRequest):
    """Generate a complete website from a prompt."""
    
    project_id = request.project_id or f"project_{uuid.uuid4().hex[:8]}"
    
    try:
        # Step 1: Enhance the prompt (NLP)
        enhanced_prompt = request.prompt
        if request.enhance_prompt:
            nlp_system = """You are a professional web designer. Expand this short prompt into a detailed website specification.
Include: sections needed, color scheme, layout suggestions, and content ideas.
Be specific but concise."""
            
            try:
                enhanced_prompt = await call_ollama(
                    f"Expand this website request: {request.prompt}",
                    OLLAMA_CHAT_MODEL,
                    nlp_system
                )
            except:
                if USE_CLOUD_FALLBACK and OPENROUTER_API_KEY:
                    enhanced_prompt = await call_openrouter(
                        f"Expand this website request: {request.prompt}",
                        "mistralai/mistral-7b-instruct",
                        nlp_system
                    )
        
        # Step 2: Generate code
        code_system = """You are an expert frontend developer. Generate a complete, production-ready website.
Use HTML5, Tailwind CSS (via CDN), and vanilla JavaScript.
Make it visually impressive with a dark theme and green (#22c55e) accents.
Include smooth animations and responsive design.
Return the code in ```html, ```css, and ```javascript code blocks."""

        code_prompt = f"""Generate a complete website based on this specification:

{enhanced_prompt}

Requirements:
1. Use Tailwind CSS via CDN
2. Dark theme with green accent (#22c55e)
3. Fully responsive
4. Include animations
5. Single HTML file with embedded styles and scripts

Return the complete code."""

        model_used = "local"
        try:
            code_response = await call_ollama(code_prompt, OLLAMA_CODE_MODEL, code_system)
        except:
            if USE_CLOUD_FALLBACK and OPENROUTER_API_KEY:
                code_response = await call_openrouter(
                    code_prompt,
                    "deepseek/deepseek-coder-33b-instruct",
                    code_system
                )
                model_used = "cloud"
            else:
                raise
        
        # Extract code blocks
        code_blocks = extract_code_blocks(code_response)
        
        return GenerationResponse(
            success=True,
            project_id=project_id,
            html=code_blocks["html"] or code_response,
            css=code_blocks["css"],
            javascript=code_blocks["js"],
            enhanced_prompt=enhanced_prompt if request.enhance_prompt else None,
            model_used=model_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return GenerationResponse(
            success=False,
            project_id=project_id,
            html="",
            css="",
            javascript="",
            error=str(e)
        )


@app.post("/api/chat")
async def chat_modify(request: ChatRequest):
    """Chat endpoint for iterative code modifications."""
    
    try:
        system_prompt = """You are a helpful web development assistant.
The user wants to modify their website code.
Analyze their request and provide the updated code.
If they ask for a specific change, make only that change.
Return updated code in appropriate code blocks."""

        # Build context with current code
        context = f"""Current HTML:
```html
{request.current_html or 'No HTML yet'}
```

Current CSS:
```css
{request.current_css or 'No CSS yet'}
```

Current JavaScript:
```javascript
{request.current_js or 'No JavaScript yet'}
```

User request: {request.message}

Please make the requested modifications and return the updated code."""

        try:
            response = await call_ollama(context, OLLAMA_CODE_MODEL, system_prompt)
            model_used = "local"
        except:
            if USE_CLOUD_FALLBACK and OPENROUTER_API_KEY:
                response = await call_openrouter(
                    context,
                    "deepseek/deepseek-coder-33b-instruct",
                    system_prompt
                )
                model_used = "cloud"
            else:
                raise
        
        code_blocks = extract_code_blocks(response)
        
        return {
            "success": True,
            "project_id": request.project_id,
            "message": "Code updated successfully",
            "html": code_blocks["html"] or request.current_html,
            "css": code_blocks["css"] or request.current_css,
            "javascript": code_blocks["js"] or request.current_js,
            "assistant_response": response,
            "model_used": model_used
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/models")
async def list_models():
    """List available Ollama models."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_HOST}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {
                    "success": True,
                    "models": [{"name": m["name"], "size": m.get("size")} for m in models]
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    
    return {"success": False, "models": []}


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

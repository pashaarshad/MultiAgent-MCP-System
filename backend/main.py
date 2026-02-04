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
import sys

# Add parent directory to path (for future MCP integrations)
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv

# Load environment variables from ROOT .env file (outside backend folder)
ROOT_DIR = os.path.join(os.path.dirname(__file__), '..')
load_dotenv(os.path.join(ROOT_DIR, '.env'))

# Config loaded
print("Environment loaded.")



app = FastAPI(
    title="Multi-Agent MCP Backend",
    description="Backend API for the Multi-Agent MCP System - NLP + Code Generation with Ollama",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    print(">>> BACKEND SERVER STARTING UP ON PORT 8000 <<<")
    print(f">>> OLLAMA HOST: {OLLAMA_HOST}")
    print(f">>> NLP MODEL: {OLLAMA_CHAT_MODEL}")
    print(f">>> CODE MODEL: {OLLAMA_CODE_MODEL}")
    print(f">>> CLOUD MODE: {'ENABLED (Preferred)' if PREFER_CLOUD else ('Fallback Only' if USE_CLOUD_FALLBACK else 'Disabled')}")



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
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.2:3b")
OLLAMA_CODE_MODEL = os.getenv("OLLAMA_CODE_MODEL", "llama3.2:3b")

# Cloud Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
CLOUD_CHAT_MODEL = os.getenv("CLOUD_CHAT_MODEL", "google/gemini-2.0-flash-exp:free")
CLOUD_CODE_MODEL = os.getenv("CLOUD_CODE_MODEL", "google/gemini-2.0-flash-exp:free")

USE_CLOUD_FALLBACK = os.getenv("FALLBACK_TO_CLOUD", "true").lower() == "true"
PREFER_CLOUD = os.getenv("PREFER_CLOUD", "true").lower() == "true"

# Projects storage directory (outside frontend/backend)
PROJECTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'projects_recent')
os.makedirs(PROJECTS_DIR, exist_ok=True)


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
            # 10x Enhancement Prompt
            nlp_system = """You are a visionary Product Manager and Web Architect. 
Your goal is to expand the user's request into a COMPREHENSIVE website specification.
Expand it by 10x. Provide extreme detail on:
- Visual Design (Color palette, typography, exact hex codes, spacing, shadows)
- Layout Structure (Header, Hero, Features, Testimonials, Footer, etc.)
- Content Strategy (Headlines, copy text, button labels)
- Animations & Interactions (Hover effects, scroll reveals, transitions)
- User Experience (Navigation flow, responsiveness, accessibility)

The output should be a detailed narrative that allows a developer to build it without asking questions.
Make it professional, modern, and visually stunning."""
            
            use_cloud = PREFER_CLOUD and bool(OPENROUTER_API_KEY)
            
            try:
                if use_cloud:
                    # Use Cloud Model (Gemini/Qwen)
                    enhanced_prompt = await call_openrouter(
                        f"Expand this website request: {request.prompt}",
                        CLOUD_CHAT_MODEL, 
                        nlp_system
                    )
                else:
                    enhanced_prompt = await call_ollama(
                        f"Expand this website request: {request.prompt}",
                        OLLAMA_CHAT_MODEL,
                        nlp_system
                    )
            except Exception as e:
                print(f"NLP Enhancement failed: {e}")
                # Fallback to local if cloud fails
                try:
                    enhanced_prompt = await call_ollama(
                        f"Expand this website request: {request.prompt}",
                        OLLAMA_CHAT_MODEL,
                        nlp_system
                    )
                except: pass

        # Step 2: Generate Code (Code MCP / LLM)
        code_system = """You are an expert Frontend Developer. Build the website exactly as specified.
Use HTML5, Tailwind CSS (via CDN), and vanilla JavaScript.
Make it visually impressive with a dark theme and green (#22c55e) accents.
Structure the code as a SINGLE FILE (index.html) containing <style> and <script>.
Ensure responsive design mobile-first.

Return the code in ```html code block.
"""

        code_prompt = f"""Build this website:
        
{enhanced_prompt}

Requirements:
1. Use Tailwind CSS
2. High quality design
3. Responsive
4. Single HTML file
"""

        model_used = "local"
        use_cloud = PREFER_CLOUD and bool(OPENROUTER_API_KEY)

        try:
            if use_cloud:
                print(f">>> Generating with Cloud ({CLOUD_CODE_MODEL})...")
                code_response = await call_openrouter(
                    code_prompt,
                    CLOUD_CODE_MODEL,
                    code_system
                )
                model_used = f"cloud ({CLOUD_CODE_MODEL})"
            else:
                code_response = await call_ollama(code_prompt, OLLAMA_CODE_MODEL, code_system)
        except Exception as e:
            print(f"Primary Code Generation failed: {e}")
            if use_cloud and USE_CLOUD_FALLBACK:
                 # Fallback to local
                 print(">>> Falling back to Local Ollama...")
                 code_response = await call_ollama(code_prompt, OLLAMA_CODE_MODEL, code_system)
                 model_used = "local (fallback)"
            else:
                 raise
        
        # Extract code blocks
        code_blocks = extract_code_blocks(code_response)
        
        # Save project to projects_recent folder
        project_folder = os.path.join(PROJECTS_DIR, project_id)
        os.makedirs(project_folder, exist_ok=True)
        
        # Save HTML
        html_content = code_blocks["html"] or code_response
        with open(os.path.join(project_folder, "index.html"), "w", encoding="utf-8") as f:
            f.write(html_content)
        
        # Save CSS if present
        if code_blocks["css"]:
            with open(os.path.join(project_folder, "styles.css"), "w", encoding="utf-8") as f:
                f.write(code_blocks["css"])
        
        # Save JS if present
        if code_blocks["js"]:
            with open(os.path.join(project_folder, "script.js"), "w", encoding="utf-8") as f:
                f.write(code_blocks["js"])
        
        # Save project metadata
        metadata = {
            "project_id": project_id,
            "original_prompt": request.prompt,
            "enhanced_prompt": enhanced_prompt,
            "created_at": datetime.now().isoformat(),
            "model_used": model_used
        }
        with open(os.path.join(project_folder, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Project saved to: {project_folder}")
        
        # Assemble Response
        return GenerationResponse(
            success=True,
            project_id=project_id,
            html=html_content,
            css=code_blocks["css"],
            javascript=code_blocks["js"],
            enhanced_prompt=f"**Website Plan:**\n\n{enhanced_prompt}",
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


class EnhanceRequest(BaseModel):
    prompt: str

@app.post("/api/enhance")
async def enhance_prompt_endpoint(request: EnhanceRequest):
    """
    Standalone endpoint to expand a short prompt into a detailed specification.
    """
    model = CLOUD_CHAT_MODEL if PREFER_CLOUD else OLLAMA_CHAT_MODEL
    print(f">>> Enhancing prompt with {model}...")

    # The "Mega Architect" System Prompt (optimized for Structure & Detail)
    nlp_system = """You are an elite Lead Product Designer and Grid System Architect.
Your goal is to transform the user's request into a MASSIVE, DETAILED website specification.

INSTRUCTIONS:
1. **Analyze**: Understand the core intent (e.g., "YouTube Clone").
2. **Expand**: Generate a comprehensive comprehensive 360-degree plan.
3. **Structure**: Break it down into strict sections.

REQUIRED SECTIONS (Do not output markdown formatting like # or ##, just use CAPS for headers):
- BRANDING (Name, Colors, Typography, Vibe)
- VISUAL LANGUAGE (Glassmorphism, Gradients, Spacing, Borders)
- LANDING PAGE STRUCTURE (Hero, Features, How it Works, Testimonials, Footer)
- COMPONENT DETAILS (Buttons, Inputs, Cards, Navigation)
- USER EXPERIENCE (Hover effects, Animations, Transitions)
- COPYWRITING (Headlines, Subtext, Call to Action)

RULES:
- Do NOT write code.
- Write at least 500 words of detailed design specs.
- Use professional, expensive-sounding design terminology.
- Be extremely specific about colors (Hex codes) and layout (Flex/Grid).

Output the text directly."""

    try:
        use_cloud = PREFER_CLOUD and bool(OPENROUTER_API_KEY)
        
        if use_cloud:
            enhanced_text = await call_openrouter(
                f"Expand this idea into a full spec: {request.prompt}",
                CLOUD_CHAT_MODEL,
                nlp_system
            )
        else:
            enhanced_text = await call_ollama(
                f"Expand this idea into a full spec: {request.prompt}",
                OLLAMA_CHAT_MODEL,
                nlp_system
            )
            
        return {"enhanced_prompt": enhanced_text}
        
    except Exception as e:
        print(f"Enhancement failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat_modify(request: ChatRequest):
    """Chat endpoint for iterative code modifications."""
    
    try:
        system_prompt = """You are a helpful web development assistant.
The user wants to modify their website code.
Analyze their request and provide the updated code.
If they ask for a specific change, make only that change.
Return updated code in appropriate code blocks."""

        # Build context with current codes
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

        model_used = "local"
        use_cloud = PREFER_CLOUD and bool(OPENROUTER_API_KEY)
        
        try:
            if use_cloud:
                response = await call_openrouter(context, CLOUD_CODE_MODEL, system_prompt)
                model_used = f"cloud ({CLOUD_CODE_MODEL})"
            else:
                response = await call_ollama(context, OLLAMA_CODE_MODEL, system_prompt)
        except Exception as e:
            print(f"Chat failed: {e}")
            if use_cloud and USE_CLOUD_FALLBACK:
                response = await call_ollama(context, OLLAMA_CODE_MODEL, system_prompt)
                model_used = "local (fallback)"
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
# PROJECT MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/projects")
async def list_projects():
    """List all recent projects."""
    try:
        projects = []
        
        # Iterate through project folders
        for folder_name in os.listdir(PROJECTS_DIR):
            folder_path = os.path.join(PROJECTS_DIR, folder_name)
            if os.path.isdir(folder_path):
                metadata_path = os.path.join(folder_path, "metadata.json")
                
                if os.path.exists(metadata_path):
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                        projects.append({
                            "project_id": metadata.get("project_id", folder_name),
                            "name": metadata.get("original_prompt", folder_name)[:50] + "...",
                            "created_at": metadata.get("created_at", ""),
                            "model_used": metadata.get("model_used", "unknown")
                        })
                else:
                    # Fallback if no metadata
                    projects.append({
                        "project_id": folder_name,
                        "name": folder_name,
                        "created_at": "",
                        "model_used": "unknown"
                    })
        
        # Sort by created_at descending (newest first)
        projects.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {
            "success": True,
            "projects": projects,
            "count": len(projects)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "projects": []
        }


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """Load a specific project by ID."""
    try:
        project_folder = os.path.join(PROJECTS_DIR, project_id)
        
        if not os.path.exists(project_folder):
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Read HTML
        html_path = os.path.join(project_folder, "index.html")
        html_content = ""
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as f:
                html_content = f.read()
        
        # Read CSS
        css_path = os.path.join(project_folder, "styles.css")
        css_content = ""
        if os.path.exists(css_path):
            with open(css_path, "r", encoding="utf-8") as f:
                css_content = f.read()
        
        # Read JS
        js_path = os.path.join(project_folder, "script.js")
        js_content = ""
        if os.path.exists(js_path):
            with open(js_path, "r", encoding="utf-8") as f:
                js_content = f.read()
        
        # Read metadata
        metadata_path = os.path.join(project_folder, "metadata.json")
        metadata = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        
        return {
            "success": True,
            "project_id": project_id,
            "html": html_content,
            "css": css_content,
            "javascript": js_content,
            "metadata": metadata
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

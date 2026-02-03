# NLP MCP Server - Prompt Enhancement
# Multi-Agent MCP System

from mcp.server.fastmcp import FastMCP
from pydantic import Field
import httpx
import os
import json
from typing import Optional

# ============================================
# NLP MCP SERVER
# ============================================
# Purpose: Enhance user prompts into detailed specifications
# Models: Ollama (local) or OpenRouter (cloud fallback)

mcp = FastMCP("nlp-mcp-server")

# Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "mistral:7b")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_CHAT_MODEL", "mistralai/mistral-7b-instruct")
USE_CLOUD_FALLBACK = os.getenv("FALLBACK_TO_CLOUD", "true").lower() == "true"


# ============================================
# HELPER FUNCTIONS
# ============================================

async def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Call Ollama local model for text generation."""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
    except Exception as e:
        raise Exception(f"Ollama error: {str(e)}")


async def call_openrouter(prompt: str, system_prompt: str = "") -> str:
    """Call OpenRouter cloud API as fallback."""
    if not OPENROUTER_API_KEY:
        raise Exception("OpenRouter API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt} if system_prompt else None,
                        {"role": "user", "content": prompt}
                    ]
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"OpenRouter error: {str(e)}")


async def generate_text(prompt: str, system_prompt: str = "") -> str:
    """Generate text using local model with cloud fallback."""
    try:
        # Try local Ollama first
        return await call_ollama(prompt, system_prompt)
    except Exception as ollama_error:
        if USE_CLOUD_FALLBACK and OPENROUTER_API_KEY:
            # Fallback to cloud
            return await call_openrouter(prompt, system_prompt)
        else:
            raise ollama_error


# ============================================
# MCP TOOLS
# ============================================

@mcp.tool()
async def enhance_prompt(
    user_prompt: str = Field(description="The user's original short prompt"),
    context: Optional[str] = Field(default=None, description="Additional context about the project")
) -> dict:
    """
    Enhance a short user prompt into a detailed website specification.
    This tool takes a simple prompt like "create a landing page" and
    expands it into a comprehensive specification for code generation.
    """
    
    system_prompt = """You are a professional web designer and UX expert. 
Your task is to expand a short user prompt into a detailed website specification.

For each prompt, provide:
1. A clear title for the website
2. The overall design style (modern, minimal, corporate, creative, etc.)
3. Color scheme suggestions (primary, secondary, accent colors)
4. List of sections/components needed
5. Content suggestions for each section
6. Interactive elements and animations
7. Responsive design considerations

Format your response as a structured JSON object."""

    enhancement_prompt = f"""User's prompt: "{user_prompt}"
{f'Additional context: {context}' if context else ''}

Please expand this into a detailed website specification. Return a JSON object with the following structure:
{{
    "title": "Website title",
    "style": "Design style description",
    "colorScheme": {{
        "primary": "#hexcode",
        "secondary": "#hexcode",
        "accent": "#hexcode",
        "background": "#hexcode",
        "text": "#hexcode"
    }},
    "sections": [
        {{
            "name": "Section name",
            "type": "hero|features|about|testimonials|cta|footer|etc",
            "content": "Description of content",
            "elements": ["list", "of", "elements"]
        }}
    ],
    "interactions": ["List of interactive elements"],
    "responsive": "Responsive design notes"
}}"""

    try:
        response = await generate_text(enhancement_prompt, system_prompt)
        
        # Try to parse as JSON, if fails return as structured text
        try:
            enhanced_spec = json.loads(response)
            return {
                "success": True,
                "original_prompt": user_prompt,
                "enhanced_specification": enhanced_spec,
                "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
            }
        except json.JSONDecodeError:
            return {
                "success": True,
                "original_prompt": user_prompt,
                "enhanced_specification": response,
                "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud",
                "format": "text"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "original_prompt": user_prompt
        }


@mcp.tool()
async def classify_intent(
    user_prompt: str = Field(description="The user's prompt to classify")
) -> dict:
    """
    Classify the user's intent to determine what type of website they want.
    Returns: website type, complexity level, and required features.
    """
    
    system_prompt = """You are an AI assistant that classifies website requests.
Analyze the user's prompt and determine:
1. Website type (landing, portfolio, blog, ecommerce, dashboard, etc.)
2. Complexity (simple, medium, complex)
3. Required features (forms, animations, media, etc.)
4. Suggested technologies

Return a JSON object."""

    classification_prompt = f"""Classify this website request: "{user_prompt}"

Return JSON:
{{
    "website_type": "type",
    "complexity": "simple|medium|complex",
    "features": ["list", "of", "features"],
    "technologies": ["suggested", "technologies"],
    "requires_images": true/false,
    "requires_backend": true/false
}}"""

    try:
        response = await generate_text(classification_prompt, system_prompt)
        
        try:
            classification = json.loads(response)
            return {
                "success": True,
                "prompt": user_prompt,
                "classification": classification
            }
        except json.JSONDecodeError:
            return {
                "success": True,
                "prompt": user_prompt,
                "classification": response,
                "format": "text"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def generate_content(
    section_type: str = Field(description="Type of section (hero, about, features, etc.)"),
    context: str = Field(description="Context about the website"),
    tone: Optional[str] = Field(default="professional", description="Tone of content (professional, casual, playful, etc.)")
) -> dict:
    """
    Generate content for a specific website section.
    Returns copy/text content for headlines, descriptions, CTAs, etc.
    """
    
    system_prompt = f"""You are a professional copywriter. Generate compelling website content.
Tone: {tone}
Be concise but impactful. Return JSON format."""

    content_prompt = f"""Generate content for a {section_type} section.
Website context: {context}

Return JSON:
{{
    "headline": "Main headline",
    "subheadline": "Supporting text",
    "body": "Body content if applicable",
    "cta_text": "Call to action button text",
    "additional": {{}}
}}"""

    try:
        response = await generate_text(content_prompt, system_prompt)
        
        try:
            content = json.loads(response)
            return {
                "success": True,
                "section_type": section_type,
                "content": content
            }
        except json.JSONDecodeError:
            return {
                "success": True,
                "section_type": section_type,
                "content": response,
                "format": "text"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================
# RESOURCES
# ============================================

@mcp.resource("nlp://status")
async def get_status() -> str:
    """Get the current status of the NLP MCP server."""
    return json.dumps({
        "server": "nlp-mcp-server",
        "status": "running",
        "ollama_host": OLLAMA_HOST,
        "ollama_model": OLLAMA_MODEL,
        "cloud_fallback": USE_CLOUD_FALLBACK,
        "cloud_configured": bool(OPENROUTER_API_KEY)
    })


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    mcp.run()

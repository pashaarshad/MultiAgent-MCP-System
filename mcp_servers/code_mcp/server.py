# Code MCP Server - Frontend Code Generation
# Multi-Agent MCP System

from mcp.server.fastmcp import FastMCP
from pydantic import Field
import httpx
import os
import json
from typing import Optional

# ============================================
# CODE MCP SERVER
# ============================================
# Purpose: Generate HTML, CSS, JavaScript, and Tailwind CSS code
# Models: Ollama (Code Llama/DeepSeek) or OpenRouter (cloud fallback)

mcp = FastMCP("code-mcp-server")

# Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_CODE_MODEL = os.getenv("OLLAMA_CODE_MODEL", "deepseek-coder:6.7b")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_CODE_MODEL = os.getenv("OPENROUTER_CODE_MODEL", "deepseek/deepseek-coder-33b-instruct")
USE_CLOUD_FALLBACK = os.getenv("FALLBACK_TO_CLOUD", "true").lower() == "true"


# ============================================
# HELPER FUNCTIONS
# ============================================

async def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Call Ollama local model for code generation."""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": OLLAMA_CODE_MODEL,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
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
                    "model": OPENROUTER_CODE_MODEL,
                    "messages": messages,
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"OpenRouter error: {str(e)}")


async def generate_code(prompt: str, system_prompt: str = "") -> str:
    """Generate code using local model with cloud fallback."""
    try:
        return await call_ollama(prompt, system_prompt)
    except Exception as ollama_error:
        if USE_CLOUD_FALLBACK and OPENROUTER_API_KEY:
            return await call_openrouter(prompt, system_prompt)
        else:
            raise ollama_error


def extract_code_blocks(response: str) -> dict:
    """Extract HTML, CSS, and JavaScript code blocks from response."""
    result = {"html": "", "css": "", "js": ""}
    
    import re
    
    # Extract HTML
    html_match = re.search(r'```html\s*([\s\S]*?)```', response, re.IGNORECASE)
    if html_match:
        result["html"] = html_match.group(1).strip()
    
    # Extract CSS
    css_match = re.search(r'```css\s*([\s\S]*?)```', response, re.IGNORECASE)
    if css_match:
        result["css"] = css_match.group(1).strip()
    
    # Extract JavaScript
    js_match = re.search(r'```(?:javascript|js)\s*([\s\S]*?)```', response, re.IGNORECASE)
    if js_match:
        result["js"] = js_match.group(1).strip()
    
    # If no code blocks found, check if it's a single HTML file
    if not any(result.values()):
        # Check for inline style and script
        if '<html' in response.lower() or '<!doctype' in response.lower():
            result["html"] = response.strip()
    
    return result


# ============================================
# MCP TOOLS
# ============================================

@mcp.tool()
async def generate_html(
    specification: str = Field(description="Detailed specification for the HTML structure"),
    include_tailwind: bool = Field(default=True, description="Include Tailwind CSS classes"),
    dark_mode: bool = Field(default=True, description="Use dark mode styling")
) -> dict:
    """
    Generate HTML code based on a detailed specification.
    Returns structured HTML with optional Tailwind CSS classes.
    """
    
    system_prompt = """You are an expert frontend developer specializing in HTML5 and Tailwind CSS.
Generate clean, semantic, accessible HTML code.
Always use proper HTML5 structure with doctype, head, and body.
Use modern best practices and include responsive design.
Output ONLY the code, no explanations."""

    code_prompt = f"""Generate a complete HTML file based on this specification:

{specification}

Requirements:
- Use Tailwind CSS for styling: {include_tailwind}
- Dark mode theme: {dark_mode}
- Include CDN link for Tailwind CSS if using Tailwind
- Use semantic HTML5 elements
- Make it fully responsive
- Include proper meta tags

Return the complete HTML code in a ```html code block."""

    try:
        response = await generate_code(code_prompt, system_prompt)
        code_blocks = extract_code_blocks(response)
        
        return {
            "success": True,
            "html": code_blocks["html"] or response,
            "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def generate_css(
    specification: str = Field(description="Detailed specification for the CSS styles"),
    use_tailwind: bool = Field(default=False, description="Generate custom CSS (false) or Tailwind utilities (true)")
) -> dict:
    """
    Generate CSS code based on a detailed specification.
    Can generate vanilla CSS or Tailwind utility classes.
    """
    
    system_prompt = """You are an expert CSS developer.
Generate clean, organized, maintainable CSS code.
Use CSS custom properties (variables) for theming.
Include responsive media queries.
Output ONLY the code, no explanations."""

    code_prompt = f"""Generate CSS styles based on this specification:

{specification}

Requirements:
- Use CSS custom properties for colors and spacing
- Include hover and focus states
- Add smooth transitions
- Make it responsive with media queries
- Use modern CSS features (flexbox, grid)

Return the CSS code in a ```css code block."""

    try:
        response = await generate_code(code_prompt, system_prompt)
        code_blocks = extract_code_blocks(response)
        
        return {
            "success": True,
            "css": code_blocks["css"] or response,
            "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def generate_javascript(
    specification: str = Field(description="Detailed specification for the JavaScript functionality"),
    use_vanilla: bool = Field(default=True, description="Use vanilla JavaScript (true) or include libraries (false)")
) -> dict:
    """
    Generate JavaScript code for interactivity.
    Returns clean, modern JavaScript code.
    """
    
    system_prompt = """You are an expert JavaScript developer.
Generate clean, modern ES6+ JavaScript code.
Use event delegation and proper DOM manipulation.
Include error handling and loading states.
Output ONLY the code, no explanations."""

    code_prompt = f"""Generate JavaScript code based on this specification:

{specification}

Requirements:
- Use vanilla JavaScript: {use_vanilla}
- Use ES6+ features (arrow functions, const/let, template literals)
- Add proper event listeners
- Include smooth animations where appropriate
- Handle edge cases

Return the JavaScript code in a ```javascript code block."""

    try:
        response = await generate_code(code_prompt, system_prompt)
        code_blocks = extract_code_blocks(response)
        
        return {
            "success": True,
            "javascript": code_blocks["js"] or response,
            "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def generate_complete_website(
    specification: str = Field(description="Complete website specification from NLP enhancement"),
    single_file: bool = Field(default=True, description="Generate as single HTML file with embedded CSS/JS")
) -> dict:
    """
    Generate a complete website with HTML, CSS, and JavaScript.
    Can output as a single file or separate files.
    """
    
    system_prompt = """You are a full-stack frontend developer.
Generate a complete, production-ready website.
Include all HTML, CSS, and JavaScript in proper structure.
Use Tailwind CSS via CDN for styling.
Make it visually impressive with animations and modern design.
Output clean, well-organized code."""

    code_prompt = f"""Generate a complete website based on this specification:

{specification}

Requirements:
1. Use HTML5 with semantic elements
2. Include Tailwind CSS via CDN
3. Add custom CSS for animations and effects
4. Include JavaScript for interactivity
5. Make it fully responsive
6. Use a dark theme with green accent (#22c55e)
7. Add smooth transitions and hover effects
8. Include proper accessibility attributes

{"Return as a single HTML file with embedded <style> and <script> tags." if single_file else "Return separate code blocks for HTML, CSS, and JavaScript."}

Return the code in appropriate code blocks (```html, ```css, ```javascript)."""

    try:
        response = await generate_code(code_prompt, system_prompt)
        code_blocks = extract_code_blocks(response)
        
        if single_file:
            # Return the complete HTML (which may include embedded CSS/JS)
            return {
                "success": True,
                "html": code_blocks["html"] or response,
                "css": code_blocks.get("css", ""),
                "javascript": code_blocks.get("js", ""),
                "single_file": True,
                "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
            }
        else:
            return {
                "success": True,
                "html": code_blocks["html"],
                "css": code_blocks["css"],
                "javascript": code_blocks["js"],
                "single_file": False,
                "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def modify_code(
    current_code: str = Field(description="The current code to modify"),
    modification_request: str = Field(description="What changes to make"),
    code_type: str = Field(default="html", description="Type of code: html, css, or javascript")
) -> dict:
    """
    Modify existing code based on user request.
    Useful for iterative improvements.
    """
    
    system_prompt = f"""You are an expert {code_type.upper()} developer.
Modify the provided code according to the user's request.
Keep the existing structure and only make requested changes.
Output ONLY the modified code, no explanations."""

    code_prompt = f"""Modify this {code_type} code:

```{code_type}
{current_code}
```

Requested changes: {modification_request}

Return the complete modified code in a ```{code_type} code block."""

    try:
        response = await generate_code(code_prompt, system_prompt)
        code_blocks = extract_code_blocks(response)
        
        modified_code = code_blocks.get(code_type if code_type != "javascript" else "js", response)
        
        return {
            "success": True,
            "modified_code": modified_code,
            "code_type": code_type,
            "model_used": "local" if "ollama" in OLLAMA_HOST else "cloud"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================
# RESOURCES
# ============================================

@mcp.resource("code://status")
async def get_status() -> str:
    """Get the current status of the Code MCP server."""
    return json.dumps({
        "server": "code-mcp-server",
        "status": "running",
        "ollama_host": OLLAMA_HOST,
        "ollama_model": OLLAMA_CODE_MODEL,
        "cloud_fallback": USE_CLOUD_FALLBACK,
        "cloud_configured": bool(OPENROUTER_API_KEY)
    })


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    mcp.run()

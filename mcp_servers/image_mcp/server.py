# Image MCP Server - Image Generation
# Multi-Agent MCP System

from mcp.server.fastmcp import FastMCP
from pydantic import Field
import httpx
import os
import json
import base64
from typing import Optional
from pathlib import Path

# ============================================
# IMAGE MCP SERVER
# ============================================
# Purpose: Generate images for websites
# Models: Stable Diffusion (local) or Stability AI / Hugging Face (cloud)

mcp = FastMCP("image-mcp-server")

# Configuration
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY", "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
USE_LOCAL_SD = os.getenv("USE_LOCAL_STABLE_DIFFUSION", "false").lower() == "true"
LOCAL_SD_URL = os.getenv("LOCAL_SD_URL", "http://localhost:7860")
OUTPUT_DIR = os.getenv("IMAGE_OUTPUT_DIR", "./generated_images")

# Ensure output directory exists
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


# ============================================
# HELPER FUNCTIONS
# ============================================

async def call_local_sd(prompt: str, negative_prompt: str = "", width: int = 512, height: int = 512) -> bytes:
    """Call local Stable Diffusion (Automatic1111 or similar)."""
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{LOCAL_SD_URL}/sdapi/v1/txt2img",
                json={
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "width": width,
                    "height": height,
                    "steps": 20,
                    "cfg_scale": 7,
                    "sampler_name": "Euler a"
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # Decode base64 image
            image_data = base64.b64decode(result["images"][0])
            return image_data
    except Exception as e:
        raise Exception(f"Local Stable Diffusion error: {str(e)}")


async def call_stability_ai(prompt: str, negative_prompt: str = "", width: int = 512, height: int = 512) -> bytes:
    """Call Stability AI API for image generation."""
    if not STABILITY_API_KEY:
        raise Exception("Stability AI API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                headers={
                    "Authorization": f"Bearer {STABILITY_API_KEY}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json={
                    "text_prompts": [
                        {"text": prompt, "weight": 1.0},
                        {"text": negative_prompt, "weight": -1.0} if negative_prompt else None
                    ],
                    "cfg_scale": 7,
                    "width": width,
                    "height": height,
                    "samples": 1,
                    "steps": 30
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # Decode base64 image
            image_data = base64.b64decode(result["artifacts"][0]["base64"])
            return image_data
    except Exception as e:
        raise Exception(f"Stability AI error: {str(e)}")


async def call_huggingface(prompt: str) -> bytes:
    """Call Hugging Face Inference API for image generation."""
    if not HUGGINGFACE_API_KEY:
        raise Exception("Hugging Face API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                headers={
                    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}"
                },
                json={"inputs": prompt}
            )
            response.raise_for_status()
            return response.content
    except Exception as e:
        raise Exception(f"Hugging Face error: {str(e)}")


async def generate_image(prompt: str, negative_prompt: str = "", width: int = 512, height: int = 512) -> bytes:
    """Generate image using available service."""
    if USE_LOCAL_SD:
        try:
            return await call_local_sd(prompt, negative_prompt, width, height)
        except Exception as e:
            print(f"Local SD failed: {e}, trying cloud...")
    
    # Try Stability AI first
    if STABILITY_API_KEY:
        try:
            return await call_stability_ai(prompt, negative_prompt, width, height)
        except Exception as e:
            print(f"Stability AI failed: {e}, trying Hugging Face...")
    
    # Try Hugging Face as fallback
    if HUGGINGFACE_API_KEY:
        return await call_huggingface(prompt)
    
    raise Exception("No image generation service available. Configure STABILITY_API_KEY or HUGGINGFACE_API_KEY")


def save_image(image_data: bytes, filename: str) -> str:
    """Save image to file and return path."""
    filepath = Path(OUTPUT_DIR) / filename
    with open(filepath, 'wb') as f:
        f.write(image_data)
    return str(filepath)


# ============================================
# MCP TOOLS
# ============================================

@mcp.tool()
async def generate_website_image(
    description: str = Field(description="Description of the image to generate"),
    image_type: str = Field(default="hero", description="Type: hero, feature, icon, background, product"),
    style: str = Field(default="modern", description="Style: modern, minimal, corporate, creative, photorealistic"),
    width: int = Field(default=1024, description="Image width in pixels"),
    height: int = Field(default=576, description="Image height in pixels")
) -> dict:
    """
    Generate an image for website use.
    Returns base64 encoded image and saves to file.
    """
    
    # Enhance the prompt based on type and style
    style_prompts = {
        "modern": "modern, sleek, professional, high quality, 4k",
        "minimal": "minimalist, clean, simple, elegant, white space",
        "corporate": "corporate, business, professional, formal",
        "creative": "creative, artistic, colorful, unique, dynamic",
        "photorealistic": "photorealistic, realistic, high detail, professional photography"
    }
    
    type_prompts = {
        "hero": "wide shot, banner image, website hero section",
        "feature": "icon style, feature illustration, centered",
        "icon": "icon, simple, clean, symbolic",
        "background": "background texture, pattern, subtle",
        "product": "product photography, centered, studio lighting"
    }
    
    enhanced_prompt = f"{description}, {style_prompts.get(style, style_prompts['modern'])}, {type_prompts.get(image_type, type_prompts['hero'])}"
    negative_prompt = "blurry, low quality, distorted, ugly, text, watermark, signature"
    
    try:
        image_data = await generate_image(enhanced_prompt, negative_prompt, width, height)
        
        # Save image
        import uuid
        filename = f"{image_type}_{uuid.uuid4().hex[:8]}.png"
        filepath = save_image(image_data, filename)
        
        # Convert to base64 for response
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        return {
            "success": True,
            "image_base64": image_base64,
            "filepath": filepath,
            "filename": filename,
            "width": width,
            "height": height,
            "prompt_used": enhanced_prompt
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def generate_placeholder_image(
    width: int = Field(default=800, description="Image width"),
    height: int = Field(default=600, description="Image height"),
    text: str = Field(default="", description="Text to display on placeholder"),
    bg_color: str = Field(default="1a1a1a", description="Background color hex (without #)"),
    text_color: str = Field(default="22c55e", description="Text color hex (without #)")
) -> dict:
    """
    Generate a simple placeholder image (no AI, just colored rectangle with text).
    Useful when image generation is not available.
    """
    
    try:
        # Use placeholder.com or similar service
        text_param = text.replace(" ", "+") if text else f"{width}x{height}"
        placeholder_url = f"https://via.placeholder.com/{width}x{height}/{bg_color}/{text_color}?text={text_param}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(placeholder_url)
            response.raise_for_status()
            image_data = response.content
        
        # Save image
        import uuid
        filename = f"placeholder_{uuid.uuid4().hex[:8]}.png"
        filepath = save_image(image_data, filename)
        
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        return {
            "success": True,
            "image_base64": image_base64,
            "filepath": filepath,
            "filename": filename,
            "width": width,
            "height": height,
            "is_placeholder": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def list_generated_images() -> dict:
    """
    List all generated images in the output directory.
    """
    try:
        images = []
        for file in Path(OUTPUT_DIR).glob("*.png"):
            images.append({
                "filename": file.name,
                "filepath": str(file),
                "size_bytes": file.stat().st_size
            })
        
        return {
            "success": True,
            "output_dir": OUTPUT_DIR,
            "images": images,
            "count": len(images)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================
# RESOURCES
# ============================================

@mcp.resource("image://status")
async def get_status() -> str:
    """Get the current status of the Image MCP server."""
    return json.dumps({
        "server": "image-mcp-server",
        "status": "running",
        "local_sd_enabled": USE_LOCAL_SD,
        "local_sd_url": LOCAL_SD_URL if USE_LOCAL_SD else None,
        "stability_configured": bool(STABILITY_API_KEY),
        "huggingface_configured": bool(HUGGINGFACE_API_KEY),
        "output_dir": OUTPUT_DIR
    })


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    mcp.run()

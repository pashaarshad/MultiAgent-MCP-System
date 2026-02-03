# Video MCP Server - Video/Animation Generation
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
# VIDEO MCP SERVER
# ============================================
# Purpose: Generate videos and animations for websites
# Future: Integration with video generation models

mcp = FastMCP("video-mcp-server")

# Configuration
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")
RUNWAY_API_KEY = os.getenv("RUNWAY_API_KEY", "")
OUTPUT_DIR = os.getenv("VIDEO_OUTPUT_DIR", "./generated_videos")

# Ensure output directory exists
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


# ============================================
# HELPER FUNCTIONS
# ============================================

async def call_replicate_video(prompt: str, duration: int = 4) -> str:
    """Call Replicate API for video generation (e.g., Stable Video Diffusion)."""
    if not REPLICATE_API_TOKEN:
        raise Exception("Replicate API token not configured")
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Start prediction
            response = await client.post(
                "https://api.replicate.com/v1/predictions",
                headers={
                    "Authorization": f"Token {REPLICATE_API_TOKEN}",
                    "Content-Type": "application/json"
                },
                json={
                    "version": "3f0457e4619dc8e2dca3c71f3c0f2c1c7e4f3c1e",  # Stable Video Diffusion
                    "input": {
                        "prompt": prompt,
                        "video_length": duration
                    }
                }
            )
            response.raise_for_status()
            prediction = response.json()
            prediction_id = prediction["id"]
            
            # Poll for completion
            while True:
                status_response = await client.get(
                    f"https://api.replicate.com/v1/predictions/{prediction_id}",
                    headers={"Authorization": f"Token {REPLICATE_API_TOKEN}"}
                )
                status = status_response.json()
                
                if status["status"] == "succeeded":
                    return status["output"]
                elif status["status"] == "failed":
                    raise Exception(f"Prediction failed: {status.get('error')}")
                
                import asyncio
                await asyncio.sleep(5)
                
    except Exception as e:
        raise Exception(f"Replicate error: {str(e)}")


def generate_css_animation(animation_type: str, properties: dict) -> str:
    """Generate CSS keyframe animations for web use."""
    
    animations = {
        "fade-in": """
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
.animate-fade-in {
    animation: fadeIn {duration}s ease-out forwards;
}""",
        "slide-up": """
@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY({distance}px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-slide-up {
    animation: slideUp {duration}s ease-out forwards;
}""",
        "slide-down": """
@keyframes slideDown {
    from { 
        opacity: 0;
        transform: translateY(-{distance}px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-slide-down {
    animation: slideDown {duration}s ease-out forwards;
}""",
        "scale-in": """
@keyframes scaleIn {
    from { 
        opacity: 0;
        transform: scale({start_scale});
    }
    to { 
        opacity: 1;
        transform: scale(1);
    }
}
.animate-scale-in {
    animation: scaleIn {duration}s ease-out forwards;
}""",
        "bounce": """
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-{distance}px); }
}
.animate-bounce {
    animation: bounce {duration}s ease-in-out infinite;
}""",
        "pulse": """
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
.animate-pulse {
    animation: pulse {duration}s ease-in-out infinite;
}""",
        "spin": """
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-spin {
    animation: spin {duration}s linear infinite;
}""",
        "shake": """
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-{distance}px); }
    75% { transform: translateX({distance}px); }
}
.animate-shake {
    animation: shake {duration}s ease-in-out;
}""",
        "float": """
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-{distance}px); }
}
.animate-float {
    animation: float {duration}s ease-in-out infinite;
}""",
        "gradient-shift": """
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift {duration}s ease infinite;
}"""
    }
    
    # Get the animation template
    template = animations.get(animation_type, animations["fade-in"])
    
    # Apply properties
    duration = properties.get("duration", 0.5)
    distance = properties.get("distance", 20)
    start_scale = properties.get("start_scale", 0.9)
    
    css = template.format(
        duration=duration,
        distance=distance,
        start_scale=start_scale
    )
    
    return css


# ============================================
# MCP TOOLS
# ============================================

@mcp.tool()
async def generate_css_animations(
    animations: list = Field(description="List of animation types: fade-in, slide-up, slide-down, scale-in, bounce, pulse, spin, shake, float, gradient-shift"),
    duration: float = Field(default=0.5, description="Animation duration in seconds"),
    distance: int = Field(default=20, description="Movement distance in pixels for applicable animations")
) -> dict:
    """
    Generate CSS keyframe animations for web use.
    Returns ready-to-use CSS code.
    """
    
    properties = {
        "duration": duration,
        "distance": distance,
        "start_scale": 0.9
    }
    
    css_output = []
    for animation_type in animations:
        css = generate_css_animation(animation_type, properties)
        css_output.append(css)
    
    return {
        "success": True,
        "css": "\n".join(css_output),
        "animations_generated": animations,
        "usage_example": f"Add class 'animate-{animations[0]}' to your element" if animations else ""
    }


@mcp.tool()
async def generate_lottie_placeholder(
    animation_type: str = Field(description="Type: loading, success, error, empty, search"),
    color: str = Field(default="#22c55e", description="Primary color for the animation")
) -> dict:
    """
    Get a placeholder Lottie animation URL (from LottieFiles free library).
    Returns a URL to embed in your website.
    """
    
    # Popular free Lottie animations from LottieFiles
    lottie_urls = {
        "loading": "https://lottie.host/embed/4db68bbd-31f6-4cd8-84eb-189de081159a/IGMncuoc7q.json",
        "success": "https://lottie.host/embed/6dfcdd82-f88a-46fa-8312-9ad1ca0f8cf0/UCPeVkE0oH.json",
        "error": "https://lottie.host/embed/4a4c8c32-3d0c-4c9c-8b0a-95e095f8e6e5/OP0xVQbkZb.json",
        "empty": "https://lottie.host/embed/19c55c34-9a36-4e2e-b7bd-bb5c11e7b2c4/g6z0M1VXLA.json",
        "search": "https://lottie.host/embed/bb2da14c-f5c4-4a6b-a58c-2dd79e7b3a8b/5Y8cLgq9Nb.json"
    }
    
    lottie_url = lottie_urls.get(animation_type, lottie_urls["loading"])
    
    # Generate embed code
    embed_code = f'''<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
<lottie-player 
    src="{lottie_url}"
    background="transparent"
    speed="1"
    style="width: 300px; height: 300px"
    loop
    autoplay
></lottie-player>'''
    
    return {
        "success": True,
        "animation_type": animation_type,
        "lottie_url": lottie_url,
        "embed_code": embed_code
    }


@mcp.tool()
async def generate_video_placeholder(
    video_type: str = Field(description="Type: hero-background, product-demo, testimonial"),
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 16:9, 4:3, 1:1, 9:16")
) -> dict:
    """
    Generate placeholder video or video CSS effect.
    Returns CSS for video-like effects when actual video generation is not available.
    """
    
    # CSS-based animated backgrounds that mimic video
    video_effects = {
        "hero-background": """
.video-placeholder-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
    background-size: 400% 400%;
    animation: gradientFlow 15s ease infinite;
}

.video-placeholder-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);
    animation: pulseGlow 8s ease-in-out infinite;
}

@keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

@keyframes pulseGlow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}""",
        "product-demo": """
.video-placeholder-product {
    position: relative;
    overflow: hidden;
    background: #111111;
    border-radius: 8px;
}

.video-placeholder-product::after {
    content: '▶';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(34, 197, 94, 0.9);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s, background 0.3s;
}

.video-placeholder-product:hover::after {
    transform: translate(-50%, -50%) scale(1.1);
    background: rgba(34, 197, 94, 1);
}""",
        "testimonial": """
.video-placeholder-testimonial {
    position: relative;
    overflow: hidden;
    background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-placeholder-testimonial::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
        transparent,
        rgba(34, 197, 94, 0.1),
        transparent 30%
    );
    animation: rotate 8s linear infinite;
}

@keyframes rotate {
    100% { transform: rotate(360deg); }
}"""
    }
    
    aspect_ratios = {
        "16:9": "aspect-ratio: 16/9",
        "4:3": "aspect-ratio: 4/3",
        "1:1": "aspect-ratio: 1/1",
        "9:16": "aspect-ratio: 9/16"
    }
    
    css = video_effects.get(video_type, video_effects["hero-background"])
    
    return {
        "success": True,
        "video_type": video_type,
        "css": css,
        "aspect_ratio_css": aspect_ratios.get(aspect_ratio, aspect_ratios["16:9"]),
        "note": "This generates CSS-based animated effects. For actual AI video generation, configure REPLICATE_API_TOKEN"
    }


@mcp.tool()
async def generate_ai_video(
    prompt: str = Field(description="Description of the video to generate"),
    duration: int = Field(default=4, description="Duration in seconds (2-8)")
) -> dict:
    """
    Generate an AI video using Replicate or similar service.
    Requires API key configuration.
    """
    
    if not REPLICATE_API_TOKEN:
        return {
            "success": False,
            "error": "Video generation requires REPLICATE_API_TOKEN. Currently, use CSS animations or Lottie animations as alternatives.",
            "alternatives": [
                "Use generate_css_animations for simple motion",
                "Use generate_lottie_placeholder for pre-made animations"
            ]
        }
    
    try:
        video_url = await call_replicate_video(prompt, duration)
        
        return {
            "success": True,
            "video_url": video_url,
            "prompt": prompt,
            "duration": duration
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================
# RESOURCES
# ============================================

@mcp.resource("video://status")
async def get_status() -> str:
    """Get the current status of the Video MCP server."""
    return json.dumps({
        "server": "video-mcp-server",
        "status": "running",
        "replicate_configured": bool(REPLICATE_API_TOKEN),
        "runway_configured": bool(RUNWAY_API_KEY),
        "css_animations": "available",
        "lottie_animations": "available",
        "output_dir": OUTPUT_DIR
    })


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    mcp.run()

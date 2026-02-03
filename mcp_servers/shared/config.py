# Shared Configuration for MCP Servers
# Multi-Agent MCP System

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# ============================================
# OLLAMA CONFIGURATION (Local LLM)
# ============================================
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "mistral:7b")
OLLAMA_CODE_MODEL = os.getenv("OLLAMA_CODE_MODEL", "deepseek-coder:6.7b")

# ============================================
# OPENROUTER CONFIGURATION (Cloud Fallback)
# ============================================
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_CHAT_MODEL = os.getenv("OPENROUTER_CHAT_MODEL", "mistralai/mistral-7b-instruct")
OPENROUTER_CODE_MODEL = os.getenv("OPENROUTER_CODE_MODEL", "deepseek/deepseek-coder-33b-instruct")

# ============================================
# IMAGE GENERATION CONFIGURATION
# ============================================
USE_LOCAL_STABLE_DIFFUSION = os.getenv("USE_LOCAL_STABLE_DIFFUSION", "false").lower() == "true"
LOCAL_SD_URL = os.getenv("LOCAL_SD_URL", "http://localhost:7860")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY", "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")

# ============================================
# VIDEO GENERATION CONFIGURATION
# ============================================
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")
RUNWAY_API_KEY = os.getenv("RUNWAY_API_KEY", "")

# ============================================
# OUTPUT DIRECTORIES
# ============================================
BASE_OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./generated")
IMAGE_OUTPUT_DIR = os.getenv("IMAGE_OUTPUT_DIR", f"{BASE_OUTPUT_DIR}/images")
VIDEO_OUTPUT_DIR = os.getenv("VIDEO_OUTPUT_DIR", f"{BASE_OUTPUT_DIR}/videos")
CODE_OUTPUT_DIR = os.getenv("CODE_OUTPUT_DIR", f"{BASE_OUTPUT_DIR}/code")

# ============================================
# FEATURE FLAGS
# ============================================
FALLBACK_TO_CLOUD = os.getenv("FALLBACK_TO_CLOUD", "true").lower() == "true"
SAVE_GENERATIONS = os.getenv("SAVE_GENERATIONS", "true").lower() == "true"
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

# ============================================
# SERVER CONFIGURATION
# ============================================
NLP_SERVER_PORT = int(os.getenv("NLP_SERVER_PORT", "8001"))
CODE_SERVER_PORT = int(os.getenv("CODE_SERVER_PORT", "8002"))
IMAGE_SERVER_PORT = int(os.getenv("IMAGE_SERVER_PORT", "8003"))
VIDEO_SERVER_PORT = int(os.getenv("VIDEO_SERVER_PORT", "8004"))


def get_config() -> dict:
    """Return all configuration as a dictionary."""
    return {
        "ollama": {
            "host": OLLAMA_HOST,
            "chat_model": OLLAMA_CHAT_MODEL,
            "code_model": OLLAMA_CODE_MODEL
        },
        "openrouter": {
            "configured": bool(OPENROUTER_API_KEY),
            "chat_model": OPENROUTER_CHAT_MODEL,
            "code_model": OPENROUTER_CODE_MODEL
        },
        "image": {
            "local_sd": USE_LOCAL_STABLE_DIFFUSION,
            "stability_configured": bool(STABILITY_API_KEY),
            "huggingface_configured": bool(HUGGINGFACE_API_KEY)
        },
        "video": {
            "replicate_configured": bool(REPLICATE_API_TOKEN),
            "runway_configured": bool(RUNWAY_API_KEY)
        },
        "features": {
            "cloud_fallback": FALLBACK_TO_CLOUD,
            "save_generations": SAVE_GENERATIONS,
            "debug_mode": DEBUG_MODE
        }
    }


def print_config():
    """Print current configuration (hides sensitive keys)."""
    config = get_config()
    print("\n=== MCP Servers Configuration ===\n")
    
    print(f"Ollama Host: {OLLAMA_HOST}")
    print(f"Ollama Chat Model: {OLLAMA_CHAT_MODEL}")
    print(f"Ollama Code Model: {OLLAMA_CODE_MODEL}")
    print()
    
    print(f"OpenRouter API: {'✓ Configured' if OPENROUTER_API_KEY else '✗ Not configured'}")
    print(f"Stability AI API: {'✓ Configured' if STABILITY_API_KEY else '✗ Not configured'}")
    print(f"Hugging Face API: {'✓ Configured' if HUGGINGFACE_API_KEY else '✗ Not configured'}")
    print(f"Replicate API: {'✓ Configured' if REPLICATE_API_TOKEN else '✗ Not configured'}")
    print()
    
    print(f"Cloud Fallback: {'Enabled' if FALLBACK_TO_CLOUD else 'Disabled'}")
    print(f"Debug Mode: {'Enabled' if DEBUG_MODE else 'Disabled'}")
    print()


if __name__ == "__main__":
    print_config()

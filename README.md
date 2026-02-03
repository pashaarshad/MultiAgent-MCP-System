# Multi-Agent MCP System

> 🚀 **AI-Powered Frontend Builder** - Generate beautiful websites from natural language prompts using multi-agent AI orchestration.

![Version](https://img.shields.io/badge/version-2.0.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![Python](https://img.shields.io/badge/Backend-Python_3.10+-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Natural Language to Website**: Describe what you want, get complete HTML/CSS/JS
- **Multi-Agent Architecture**: Specialized MCP servers for NLP, Code, Image, and Video
- **Local-First AI**: Uses Ollama for free, offline code generation
- **Cloud Fallback**: OpenRouter integration when local models are unavailable
- **Live Preview**: See your generated website in real-time
- **Responsive Preview**: Test on Desktop, Tablet, and Mobile
- **Export Ready**: Download complete project files

## 🏗️ Project Structure

```
MultiAgent-MCP-System/
├── frontend/                 # Next.js Frontend Application
│   └── src/
│       ├── app/              # Pages (Home, Builder)
│       ├── components/       # React components
│       ├── lib/              # Utilities
│       └── types/            # TypeScript types
│
├── backend/                  # FastAPI Backend Server
│   ├── main.py              # API orchestration
│   └── requirements.txt
│
├── mcp_servers/              # MCP Server Collection
│   ├── nlp_mcp/             # Prompt enhancement
│   │   └── server.py
│   ├── code_mcp/            # Code generation (HTML/CSS/JS)
│   │   └── server.py
│   ├── image_mcp/           # Image generation
│   │   └── server.py
│   ├── video_mcp/           # Video/Animation generation
│   │   └── server.py
│   ├── shared/              # Shared configuration
│   │   └── config.py
│   └── requirements.txt
│
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **Ollama** (for local AI - recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/pashaarshad/MultiAgent-MCP-System.git
cd MultiAgent-MCP-System

# ============================================
# STEP 1: Setup Frontend
# ============================================
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000

# ============================================
# STEP 2: Setup Backend (new terminal)
# ============================================
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000

# ============================================
# STEP 3: Install Ollama Models
# ============================================
# Download Ollama from https://ollama.com
ollama pull mistral:7b        # For chat/NLP
ollama pull deepseek-coder:6.7b  # For code generation

# ============================================
# STEP 4: Configure Environment
# ============================================
cp .env.example .env
# Edit .env with your API keys (optional for cloud features)
```

## 🤖 MCP Servers

### 1. NLP MCP Server (`nlp_mcp/`)
**Purpose**: Enhance user prompts into detailed specifications

| Tool | Description |
|------|-------------|
| `enhance_prompt` | Expands short prompts into detailed website specs |
| `classify_intent` | Determines website type and complexity |
| `generate_content` | Creates copy for specific sections |

### 2. Code MCP Server (`code_mcp/`)
**Purpose**: Generate HTML, CSS, and JavaScript code

| Tool | Description |
|------|-------------|
| `generate_html` | Create HTML with Tailwind CSS |
| `generate_css` | Create custom CSS styles |
| `generate_javascript` | Create interactive JavaScript |
| `generate_complete_website` | Full website generation |
| `modify_code` | Iterative code modifications |

### 3. Image MCP Server (`image_mcp/`)
**Purpose**: Generate images for websites

| Tool | Description |
|------|-------------|
| `generate_website_image` | AI-generated images |
| `generate_placeholder_image` | Simple placeholders |
| `list_generated_images` | View all generated images |

### 4. Video MCP Server (`video_mcp/`)
**Purpose**: Generate animations and video effects

| Tool | Description |
|------|-------------|
| `generate_css_animations` | CSS keyframe animations |
| `generate_lottie_placeholder` | Lottie animation embeds |
| `generate_video_placeholder` | CSS video-like effects |
| `generate_ai_video` | AI video (requires Replicate) |

## 🔧 Configuration

### Required (Free)
| Service | Purpose | Setup |
|---------|---------|-------|
| **Ollama** | Local LLM | `ollama pull mistral:7b && ollama pull deepseek-coder:6.7b` |

### Optional (For Enhanced Features)
| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenRouter | Cloud LLM fallback | [openrouter.ai](https://openrouter.ai) |
| Stability AI | Image generation | [platform.stability.ai](https://platform.stability.ai) |
| Hugging Face | Image generation | [huggingface.co](https://huggingface.co) |
| Replicate | Video generation | [replicate.com](https://replicate.com) |

## 🗺️ Implementation Plan

### ✅ V1 - Frontend UI (Complete)
- [x] Next.js project setup
- [x] Tailwind CSS with custom theme
- [x] Home page with prompt input
- [x] Builder page with chat panel
- [x] Preview panel with device modes
- [x] Code panel with syntax highlighting
- [x] Responsive design
- [x] GitHub repository

### ✅ V2 - MCP Servers (Complete)
- [x] NLP MCP Server (prompt enhancement)
- [x] Code MCP Server (HTML/CSS/JS generation)
- [x] Image MCP Server (image generation)
- [x] Video MCP Server (animations)
- [x] Backend FastAPI orchestration
- [x] Ollama integration
- [x] OpenRouter fallback

### 🔄 V3 - Integration (Next)
- [ ] Connect frontend to backend API
- [ ] Real-time streaming responses
- [ ] Project persistence (SQLite)
- [ ] Image generation in UI
- [ ] Export complete project

### 📋 V4 - Polish (Future)
- [ ] User authentication
- [ ] Project history
- [ ] Template library
- [ ] Deploy to Vercel + Render

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React 19, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.10+ |
| MCP Framework | mcp, fastmcp |
| Local AI | Ollama (Mistral, DeepSeek Coder) |
| Cloud AI | OpenRouter, Stability AI, Hugging Face |
| Icons | Lucide React |

## 📝 API Endpoints

```
POST /api/generate     # Generate website from prompt
POST /api/chat         # Modify code via chat
GET  /api/status       # System status
GET  /api/health       # Health check
GET  /api/models       # List available Ollama models
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ using Next.js, FastAPI, and Ollama
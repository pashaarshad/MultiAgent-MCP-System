# Multi-Agent MCP System

> 🚀 **AI-Powered Frontend Builder** - Generate beautiful websites from natural language prompts using multi-agent AI orchestration.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![Python](https://img.shields.io/badge/MCP_Server-Python-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Natural Language to Website**: Describe what you want, get complete HTML/CSS/JS
- **Live Preview**: See your generated website in real-time
- **Code View**: View and copy generated code with syntax highlighting
- **Responsive Preview**: Test on Desktop, Tablet, and Mobile
- **Multi-Agent Architecture**: Specialized AI agents for different tasks
- **Local-First AI**: Uses Ollama for offline, free code generation
- **Export Ready**: Download complete project files

## 🏗️ Project Structure

```
Multi-Agent MCP System/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   │   ├── home/        # Home page components
│   │   │   └── builder/     # Builder page components
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
│
├── mcp_server/              # Python MCP Server (Coming in V2)
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (For V2) Python 3.10+
- (For V2) Ollama installed locally

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/multi-agent-mcp-system.git
cd multi-agent-mcp-system

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  /* Primary Accent (Green) */
  --accent-primary: #22c55e;    /* Change this for different accent */
  --accent-secondary: #16a34a;
  --accent-tertiary: #15803d;

  /* Background Colors */
  --bg-primary: #0a0a0a;        /* Main background */
  --bg-secondary: #111111;      /* Sidebar/panels */
  --bg-tertiary: #1a1a1a;       /* Cards */
}
```

### Component Customization

All components are built with customization in mind:
- CSS custom properties for easy theming
- Tailwind utility classes for quick adjustments
- Props for runtime customization

### Layout Dimensions

```css
:root {
  --sidebar-width: 260px;           /* Sidebar width */
  --sidebar-collapsed-width: 64px;  /* Collapsed sidebar */
  --header-height: 56px;            /* Header height */
  --chat-panel-width: 380px;        /* Chat panel width */
}
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| MCP Server | Python (coming in V2) |
| AI Models | Ollama (local), OpenRouter (cloud) |
| Database | SQLite (coming in V3) |

## 🗺️ Roadmap

### V1 (Current) - Frontend UI ✅
- [x] Next.js project setup
- [x] Tailwind CSS with custom theme
- [x] Home page with prompt input
- [x] Builder page with chat panel
- [x] Preview panel with device modes
- [x] Code panel with syntax highlighting
- [x] Responsive design

### V2 (Next) - MCP Server
- [ ] Python MCP server setup
- [ ] Agent architecture
- [ ] Ollama integration
- [ ] Code generation

### V3 (Future) - Full Integration
- [ ] Image generation
- [ ] Audio generation
- [ ] Video generation
- [ ] SQLite database
- [ ] Project history

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ using Next.js and AI

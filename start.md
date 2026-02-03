# Startup Instructions

Follow these steps to start the Multi-Agent MCP System.

## 1. Start the Backend (Ollama/Python)

Open a terminal and run:

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Note:** Ensure Ollama is running (`ollama serve`) and you have pulled the model (`ollama pull llama3.2:3b`).

## 2. Start the Frontend (Next.js)

Open a **new** terminal and run:

```powershell
cd frontend
npm run dev
```

## Access the App

Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)


this is for backend api test by swagger

http://localhost:8000/docs#/default/generate_website_api_generate_post

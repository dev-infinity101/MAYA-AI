# MAYA AI CHATBOT - 2-Week MVP Development Checklist

This checklist compresses the 16-week PRD timeline into a 2-week intensive MVP sprint.

## 📅 Week 1: Foundation & Scheme Navigator

### Day 1: Project Setup 🏗️
- [x] **Repository Structure**
    - [x] Create `frontend/` (React + Vite + TS + Tailwind)
    - [x] Create `backend/` (FastAPI + Python 3.11+)
    - [x] Setup `.env` templates for both
- [x] **Database Setup (Neon.tech/Local)**
    - [x] Create PostgreSQL instance
    - [x] Enable `pgvector` extension
    - [x] Get connection string
- [x] **Dependencies**
    - [x] Backend: `fastapi`, `uvicorn`, `langchain-google-genai`, `langgraph`, `asyncpg`, `sqlalchemy`, `pgvector`
    - [x] Frontend: `axios`, `lucide-react`, `zustand`, `react-markdown`

### Day 2: Database & Data 💾
- [x] **Schema Design**
    - [x] Define `schemes` table (id, name, description, benefits, embedding, criteria)
    - [x] Define `users` table (basic auth)
    - [x] Define `chat_history` table
- [x] **Seed Data**
    - [x] Prepare JSON of 20-30 popular MSME schemes
    - [x] Write script to generate embeddings (Jina AI) and insert into DB

### Day 3: Backend Core API 🔌
- [x] **FastAPI Basics**
    - [x] Setup `main.py` application entry point
    - [x] Configure CORS (allow frontend)
    - [x] Setup DB connection (SQLAlchemy Async)
- [x] **Gemini Service** (Now `MimoService` + `JinaService`)
    - [x] Implement `MimoService` class (Singleton) for Text Generation
    - [x] Implement `JinaService` class (Singleton) for Embeddings

### Day 4: Scheme Navigator Logic 🧭
- [x] **Search Algorithm**
    - [x] Implement cosine similarity search using `pgvector`
    - [ ] Implement metadata filtering (industry, turnover)
- [x] **API Endpoint**
    - [x] `POST /api/chat/schemes`
    - [x] Logic: User Query -> Embedding -> Vector Search -> LLM Rank -> Response

### Day 5: Frontend Interface 🎨
- [x] **Layout**
    - [x] Implement "Glassmorphism" Dark UI (per UI-design.md)
    - [x] Sidebar (History) + Main Chat Area
- [x] **Components**
    - [x] `ChatInput` (with auto-resize)
    - [x] `MessageBubble` (User vs AI)
    - [x] `SchemeCard` (Display scheme details)

### Day 6: Integration & Basic Chat 🔗
- [x] **Connect Frontend-Backend**
    - [x] Setup Axios client with base URL
    - [x] Handle API loading states & errors (In Service)
- [x] **Basic Flow Test**
    - [x] User types query -> Backend searches schemes -> Frontend displays cards

### Day 7: Buffer & Refinement 🛠️
- [ ] Fix CORS issues (Partially done)
- [x] Refine Prompt Engineering for Scheme Ranking
- [ ] Ensure Mobile Responsiveness

---

## 📅 Week 2: Multi-Agent System & Launch

### Day 8: LangGraph Orchestration 🤖
- [x] **State Management**
    - [x] Define `AgentState` (messages, current_agent, user_profile)
- [x] **Router Agent**
    - [x] Implement classification logic (Scheme vs. Market vs. Brand vs. Finance)
    - [x] Route user query to appropriate node

### Day 9: Specialized Agents 🧠
- [x] **Market Research Agent**
    - [x] Prompt: Analyze competitors, trends
- [x] **Brand Consultant Agent**
    - [x] Prompt: Generate names, taglines
- [x] **Financial Advisor Agent**
    - [x] Prompt: Basic pricing, loan eligibility advice
- [x] **Marketing Agent**
    - [x] Prompt: Low-cost marketing strategies
- [x] **General Agent**
    - [x] Custom greeting and personality logic

### Day 10: Web Search Integration 🌐
- [x] **Tavily Setup**
    - [x] Get API Key
    - [x] Implement `TavilyClient` wrapper
- [x] **Agent Enhancement**
    - [x] Equip Market Agent with web search capability for real-time data

### Day 11: Advanced UI Features ✨
- [x] **Rich Responses**
    - [x] Markdown rendering for Agent responses
    - [x] Loading indicators ("Thinking, checking DB, generating" animations)
    - [x] Custom loading animation for agent invocation (e.g., "Invoking Market Agent...")
- [x] **Chat History**
    - [x] Save/Load history from DB
    - [x] "New Chat" button functionality

### Day 12: Deployment 🚀
- [ ] **Backend Deployment (Render/Koyeb)**
    - [ ] Create `Dockerfile` (if needed) or use Python environment
    - [ ] Set Environment Variables (MIMO_KEY, DB_URL, TAVILY_KEY, JINA_KEY)
- [ ] **Frontend Deployment (Vercel)**
    - [ ] Connect GitHub Repo
    - [ ] Set `VITE_API_URL`

### Day 13: Testing & Quality Assurance 🧪
- [x] **End-to-End Testing**
    - [x] Test all agent types (`verify_agentic.py`)
    - [x] Test scheme search with various industries (`test_jina_search.py`)
- [ ] **Edge Cases**
    - [ ] Handle empty search results
    - [ ] Handle API timeouts

### Day 14: Final Polish & Demo 🏆
- [ ] **Documentation**
    - [ ] Update README.md
- [x] **UI Polish**
    - [x] Glassmorphism theme implementation
    - [ ] Add animations (framer-motion)
- [ ] **MVP COMPLETE**

---

## 🚀 Extra Implementations (Not in Original PRD)
- **Jina AI Integration**: Switched from Gemini/OpenAI to Jina AI for state-of-the-art retrieval embeddings.
- **Mimo V2 Flash Integration**: Migrated to Xiaomi's Mimo model via OpenRouter for high-speed, cost-effective text generation.
- **Custom Greeting & Identity Logic**: Hardcoded "MAYA" greetings for specific keywords ("hey", "hi") to maintain brand identity and save tokens.
- **Strict Identity Enforcement**: Implemented system-level prompts in `MimoService` to ensure the assistant always identifies as "MAYA".
- **Comprehensive Testing Suite**: Added `tests/` directory with specific scripts for identity, agent routing, and embedding verification.
- **Advanced Landing Page**: Implemented a full modern landing page with Features, Pricing, and About sections.
- **ChatGPT-Style Interface**: Redesigned Chat Interface with centered search, clean typography, and advanced loading animations.

## Change Log

### [Date: 2025-12-23]
- **Migration**: Switched text generation LLM from Google Gemini to Xiaomi Mimo V2 Flash (via OpenRouter).
  - Created `MimoService` (`backend/services/mimo_service.py`).
  - Updated `backend/agents/graph.py` to use `MimoService`.
- **New Feature**: Implemented Web Search Integration.
  - Created `TavilyService` (`backend/services/tavily_service.py`).
  - Integrated Tavily search into `market_agent_node` for real-time data.

### [Date: 2026-01-09]
- **Refinement**: Implemented custom greeting logic for "MAYA" identity in `graph.py` and `main.py`.
- **Identity Enforcement**: Added system prompts in `MimoService` to prevent self-identification as "Mimo" or "Xiaomi".
- **Prompt Engineering**: Updated all agent prompts in `graph.py` with `CRITICAL` instructions to jump straight into answers and avoid unnecessary greetings.
- **Test Suite Expansion**: Added `verify_agentic.py` and `test_identity.py` for comprehensive multi-agent verification.
- **Jina AI**: Successfully integrated Jina AI for scheme embeddings and retrieval.
- **UI Redesign**: Overhauled `ChatInterface.tsx` to match modern "ChatGPT-style" UX with history and rich responses.

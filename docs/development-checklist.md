# MAYA AI CHATBOT - 2-Week MVP Development Checklist

This checklist compresses the 16-week PRD timeline into a 2-week intensive MVP sprint.

## 📅 Week 1: Foundation & Scheme Navigator

### Day 1: Project Setup 🏗️
- [x] **Repository Structure**
    - [x] Create `frontend/` (React + Vite + TS + Tailwind)
    - [x] Create `backend/` (FastAPI + Python 3.11+)
    - [x] Setup `.env` templates for both
- [ ] **Database Setup (Neon.tech)**
    - [ ] Create PostgreSQL instance
    - [ ] Enable `pgvector` extension
    - [ ] Get connection string
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
- [x] **Gemini Service**
    - [x] Implement `GeminiService` class (Singleton)
    - [x] method: `generate_text` (Flash 1.5)
    - [x] method: `embed_text` (Embedding-001)

### Day 4: Scheme Navigator Logic 🧭
- [x] **Search Algorithm**
    - [x] Implement cosine similarity search using `pgvector`
    - [ ] Implement metadata filtering (industry, turnover)
- [x] **API Endpoint**
    - [x] `POST /api/chat/schemes`
    - [x] Logic: User Query -> Embedding -> Vector Search -> LLM Rank -> Response (LLM Rank to be added)

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
- [ ] Fix CORS issues
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

### Day 10: Web Search Integration 🌐
- [x] **Tavily Setup**
    - [x] Get API Key
    - [x] Implement `TavilyClient` wrapper
- [x] **Agent Enhancement**
    - [x] Equip Market Agent with web search capability for real-time data

### Day 11: Advanced UI Features ✨
- [ ] **Rich Responses**
    - [ ] Markdown rendering for Agent responses
    - [ ] Loading indicators ("Market Agent is thinking...")
- [ ] **Chat History**
    - [ ] Save/Load history from DB
    - [ ] "New Chat" button functionality

### Day 12: Deployment 🚀
- [ ] **Backend Deployment (Render/Koyeb)**
    - [ ] Create `Dockerfile` (if needed) or use Python environment
    - [ ] Set Environment Variables (GEMINI_KEY, DB_URL, TAVILY_KEY)
- [ ] **Frontend Deployment (Vercel)**
    - [ ] Connect GitHub Repo
    - [ ] Set `VITE_API_URL`

### Day 13: Testing & Quality Assurance 🧪
- [ ] **End-to-End Testing**
    - [ ] Test all 4 agent types
    - [ ] Test scheme search with various industries
- [ ] **Edge Cases**
    - [ ] Handle empty search results
    - [ ] Handle API timeouts

### Day 14: Final Polish & Demo 🏆
- [ ] **Documentation**
    - [ ] Update README.md
- [ ] **UI Polish**
    - [ ] Add animations (framer-motion)
    - [ ] Verify color contrast and accessibility
- [ ] **MVP COMPLETE**

## Change Log

### [Date: 2025-12-23]
- **Migration**: Switched text generation LLM from Google Gemini to Xiaomi Mimo V2 Flash (via OpenRouter).
  - Created `MimoService` (`backend/services/mimo_service.py`).
  - Updated `backend/agents/graph.py` to use `MimoService`.
- **New Feature**: Implemented Web Search Integration.
  - Created `TavilyService` (`backend/services/tavily_service.py`).
  - Integrated Tavily search into `market_agent_node` for real-time data.

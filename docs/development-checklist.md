# MAYA AI CHATBOT - 2-Week MVP Development Checklist

This checklist compresses the 16-week PRD timeline into a 2-week intensive MVP sprint.

## 📅 Week 1: Foundation & Scheme Navigator

### Day 1: Project Setup 🏗️
- [ ] **Repository Structure**
    - [ ] Create `frontend/` (React + Vite + TS + Tailwind)
    - [ ] Create `backend/` (FastAPI + Python 3.11+)
    - [ ] Setup `.env` templates for both
- [ ] **Database Setup (Neon.tech)**
    - [ ] Create PostgreSQL instance
    - [ ] Enable `pgvector` extension
    - [ ] Get connection string
- [ ] **Dependencies**
    - [ ] Backend: `fastapi`, `uvicorn`, `langchain-google-genai`, `langgraph`, `asyncpg`, `sqlalchemy`, `pgvector`
    - [ ] Frontend: `axios`, `lucide-react`, `zustand`, `react-markdown`

### Day 2: Database & Data 💾
- [ ] **Schema Design**
    - [ ] Define `schemes` table (id, name, description, benefits, embedding, criteria)
    - [ ] Define `users` table (basic auth)
    - [ ] Define `chat_history` table
- [ ] **Seed Data**
    - [ ] Prepare JSON of 20-30 popular MSME schemes
    - [ ] Write script to generate embeddings (Gemini API) and insert into DB

### Day 3: Backend Core API 🔌
- [ ] **FastAPI Basics**
    - [ ] Setup `main.py` application entry point
    - [ ] Configure CORS (allow frontend)
    - [ ] Setup DB connection (SQLAlchemy Async)
- [ ] **Gemini Service**
    - [ ] Implement `GeminiService` class (Singleton)
    - [ ] method: `generate_text` (Flash 1.5)
    - [ ] method: `embed_text` (Embedding-001)

### Day 4: Scheme Navigator Logic 🧭
- [ ] **Search Algorithm**
    - [ ] Implement cosine similarity search using `pgvector`
    - [ ] Implement metadata filtering (industry, turnover)
- [ ] **API Endpoint**
    - [ ] `POST /api/chat/schemes`
    - [ ] Logic: User Query -> Embedding -> Vector Search -> LLM Rank -> Response

### Day 5: Frontend Interface 🎨
- [ ] **Layout**
    - [ ] Implement "Glassmorphism" Dark UI (per UI-design.md)
    - [ ] Sidebar (History) + Main Chat Area
- [ ] **Components**
    - [ ] `ChatInput` (with auto-resize)
    - [ ] `MessageBubble` (User vs AI)
    - [ ] `SchemeCard` (Display scheme details)

### Day 6: Integration & Basic Chat 🔗
- [ ] **Connect Frontend-Backend**
    - [ ] Setup Axios client with base URL
    - [ ] Handle API loading states & errors
- [ ] **Basic Flow Test**
    - [ ] User types query -> Backend searches schemes -> Frontend displays cards

### Day 7: Buffer & Refinement 🛠️
- [ ] Fix CORS issues
- [ ] Refine Prompt Engineering for Scheme Ranking
- [ ] Ensure Mobile Responsiveness

---

## 📅 Week 2: Multi-Agent System & Launch

### Day 8: LangGraph Orchestration 🤖
- [ ] **State Management**
    - [ ] Define `AgentState` (messages, current_agent, user_profile)
- [ ] **Router Agent**
    - [ ] Implement classification logic (Scheme vs. Market vs. Brand vs. Finance)
    - [ ] Route user query to appropriate node

### Day 9: Specialized Agents 🧠
- [ ] **Market Research Agent**
    - [ ] Prompt: Analyze competitors, trends
- [ ] **Brand Consultant Agent**
    - [ ] Prompt: Generate names, taglines
- [ ] **Financial Advisor Agent**
    - [ ] Prompt: Basic pricing, loan eligibility advice
- [ ] **Marketing Agent**
    - [ ] Prompt: Low-cost marketing strategies

### Day 10: Web Search Integration 🌐
- [ ] **Tavily Setup**
    - [ ] Get API Key
    - [ ] Implement `TavilyClient` wrapper
- [ ] **Agent Enhancement**
    - [ ] Equip Market Agent with web search capability for real-time data

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

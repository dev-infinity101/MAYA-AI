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
- [x] Fix CORS issues (Backend CORS fully configured)
- [x] Refine Prompt Engineering for Scheme Ranking
- [x] Ensure Mobile Responsiveness (Tailwind responsive classes implemented in ChatInterface & Sidebar)

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
- [x] **Edge Cases**
    - [x] Handle empty search results (Handled appropriately in scheme_agent_node fallback)
    - [x] Handle API timeouts (Implemented via AbortController abort signals in the frontend)

### Day 14: Final Polish & Demo 🏆
- [x] **Documentation**
    - [x] Update development-checklist.md and README.md with recent integrations.
- [x] **UI Polish**
    - [x] Glassmorphism theme implementation
    - [x] Add animations (Tailwind generic keyframes/`animate-in` effectively replaced framer-motion approach)
- [x] **MVP COMPLETE**

---

## 🚀 Extra Implementations (Not in Original PRD)
- **Jina AI Integration**: Switched from Gemini/OpenAI to Jina AI for state-of-the-art retrieval embeddings.
- **Mimo V2 Flash Integration**: Migrated to Xiaomi's Mimo model via OpenRouter for high-speed, cost-effective text generation.
- **Custom Greeting & Identity Logic**: Hardcoded "MAYA" greetings for specific keywords ("hey", "hi") to maintain brand identity and save tokens.
- **Strict Identity Enforcement**: Implemented system-level prompts in `MimoService` to ensure the assistant always identifies as "MAYA".
- **Comprehensive Testing Suite**: Added `tests/` directory with specific scripts for identity, agent routing, and embedding verification.
- **Advanced Landing Page**: Implemented a full modern landing page with Features, Pricing, and About sections.
- **ChatGPT-Style Interface**: Redesigned Chat Interface with centered search, clean typography, and advanced loading animations.
- **WhatsApp Channel Integration**: Launched live WhatsApp support via Twilio, allowing users to query schemes and get business advice via text.
- **Automated Response Formatting**: Created a specialized formatting engine for WhatsApp to convert rich markdown/tables into clean, readable text.
- **Twilio Request Validation**: Implemented security middleware to validate incoming WhatsApp webhooks directly from Twilio.

- **Business Health Score**: Developed dynamic real-time scoring via `health_score_service.py` and visualized in `HealthScoreCard.tsx`.
- **Comprehensive Scheme Architecture**: Complete modal ecosystem including `DraftGeneratorModal.tsx`, `EligibilityModal.tsx`, and `SchemeDetailsModal.tsx`.
- **Advanced Onboarding & Settings**: Implemented interactive `OnboardingModal.tsx` and detailed `SettingsPage.tsx` for profile management.
- **Media Image Service**: Initialized Seedream integration via `seedream_service.py` for rich media features.

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

### [Date: 2026-03-26]
- **Bug Fix**: Fixed garbled character encoding (`â‚¹` to `₹`) causing UI issues by implementing utf-8 encoding specifically for reading JSON data. Updated DB seeding scripts to prevent future errors.
- **Maintenance**: Created `fix_db.py` to retroactively repair garbled characters in the pgvector database without dropping the costly AI embeddings.
- **UI Optimization**: Refactored `ThinkingIndicator.tsx`. Replaced the CSS-heavy black gradient loop overlay with a simple, high-performance neon green dot pulse for the 'thinking' mode. Removed `overflow: hidden` dependencies to reduce layout paints.
- **UI Redesign**: Simplified 'New Chat' sidebar button by removing "Ctrl+Shift+O" visual clutter to enhance minimalist aesthetic.

### [Date: 2026-04-13]
- **Major Integration**: Implemented full WhatsApp Bot functionality via Twilio.
  - Developed `backend/routers/whatsapp.py` with webhook handling and request validation.
  - Integrated `get_or_create_whatsapp_user` in `user_service.py` using phone-number-based identity.
  - Built `format_agent_response_for_whatsapp` to handle markdown-to-WhatsApp text conversion.
  - Connected WhatsApp channel to the LangGraph multi-agent system, supporting all specialized agents (Market, Brand, Finance, etc.).
- **Frontend Bug Fixes**:
  - Resolved several critical compilation and runtime errors in `ChatInterface.tsx` related to undefined variables (`input`, `isLoading`, etc.), broken template literals, and comma operator misuse.
- **UI Refinement**: 
  - Improved the `ChatInputBox` layout by shifting the attachment (clip) icon to the bottom-left action bar, creating a cleaner and more professional input area.

### [Date: 2026-04-15]
- **Finance & Health Profiling**: Deployed the Business Health Score system (`health_score_service.py` and `HealthScoreCard.tsx`), allowing dynamic, personalized financial snapshots for MSMEs.
- **User Profiling & UX**: Integrated `OnboardingModal.tsx` for seamless data collection and `SettingsPage.tsx` enabling full management of user business parameters.
- **Comprehensive Modal Actions**: Converted static elements into deep application workflows via `EligibilityModal.tsx` and `DraftGeneratorModal.tsx`.
- **Generative Image Expansion**: Seedream API architecture introduced via `seedream_service.py` for expanded AI media output capabilities.
- **Checklist Maintenance**: Authenticated MVP status updates and aligned development logs with recent repository commits.

### [Date: 2026-04-24]
- **UI Overhaul**: Redesigned all components with Sakhi light theme, saffron glow effects on inputs, and improved accessibility.
- **New Dashboard Pages**: Added 3 new sidebar pages for Reports (business analytics), Schemes (eligibility tracking), and Applications (draft management).
- **Enhanced Animations**: Improved AbstractAnimation, AgentMonitor, and all page transitions for better user experience.
- **Connection Pooling Optimization**: Improved database connection pooling and agent routing latency for faster response times.
- **Docker Deployment**: Added Dockerfile for Google Cloud deployment with optimized build layers.

### [Date: 2026-04-30] — **Current**
- **Multilingual Support (Hindi & Hinglish)**:
  - Added language detection in `graph.py` with `_lang_suffix()` helper function.
  - Scheme agent now responds in Hindi/Hinglish based on detected language.
  - Identity responses translated to Hindi and Hinglish variants.
  - Greeting prompts adapted for multilingual audience.
  
- **Rich Draft Generation Engine**:
  - Created `backend/agents/draft_templates.py` with Gemini-powered scheme-specific prompt templates.
  - Supports PMEGP, Mudra, Stand-Up India, ODOP, and Vishwakarma schemes.
  - New `/api/draft/generate-rich` endpoint for structured, markdown-based project reports.
  - Auto-fills applicant details from user profile with `[TO BE UPDATED]` markers for missing fields.
  - Provides subsidy rates, document checklists, and implementation schedules per scheme.
  
- **Backend Enhancements**:
  - Enhanced `DraftGeneratorModal.tsx` with rich text editing and preview capabilities (461 lines → comprehensive modal).
  - Updated `graph.py` with language-aware agent routing and fallback logic.
  - Improved `router.py` with semantic understanding for multilingual queries.
  - Extended `main.py` with new lifespan hooks for language service initialization.
  - Refined `whatsapp.py` with better message formatting for multilingual support.
  - Expanded `seed_demo_data.py` with multilingual scheme descriptions and sample user profiles.
  
- **Frontend UI Refinements**:
  - Updated all animation components with consistent styling (AbstractAnimation, DocumentsAnimation, LotusAnimation, SchemeScanAnimation).
  - Improved AgentMonitor and AgentOverviewCard for better visual hierarchy.
  - Refined Sidebar navigation with language toggle support.
  - Enhanced ChatInterface with language detection hints.
  - Updated Features and LandingPage with multilingual content previews.
  - Refined Brand component for theme consistency.
  - Enhanced PageLoader with theme-aware styling.
  - Updated Footer with language information.
  - Improved index.css with language-specific typography rules.
  
- **i18n Infrastructure**:
  - Created `frontend/src/i18n/` directory with translation files.
  - Added `LanguageToggle.tsx` component for language switching.
  - Created `frontend/src/hooks/` for custom hooks supporting language context.
  
- **Documentation Assets**:
  - Generated `MAYA_Stand-Up_India_Application_Brief_Draft.md` as example draft template.
  - Added sample PDF report (`my report.pdf`) for demonstration purposes.

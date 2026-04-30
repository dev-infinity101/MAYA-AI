# MAYA AI Project

## Project Overview and Purpose

The MAYA AI Project is a full-stack web application designed to leverage advanced AI capabilities, primarily through Google Gemini, to provide an interactive experience. The application features a robust backend built with Python's FastAPI, focusing on AI agent orchestration, data management with PostgreSQL (including vector embeddings), and secure authentication. The frontend, developed using React and Vite, offers a dynamic and responsive user interface for interacting with the AI functionalities.

The core purpose of MAYA is to:
*   Provide an intuitive chat interface for users to interact with AI agents.
*   Showcase various AI features and capabilities.
*   Manage user data and AI-related information efficiently using a PostgreSQL database with vector search extensions.
*   Ensure a secure and scalable platform for AI-driven applications.

## Current Technical Stack

### Backend
*   **Language:** Python
*   **Web Framework:** FastAPI
*   **ASGI Server:** Uvicorn
*   **AI/ML & LLM Orchestration:** Langchain (with `langchain-google-genai` for Google Gemini integration), Langgraph
*   **Database:** PostgreSQL (managed with SQLAlchemy, `asyncpg`, `psycopg2-binary`)
*   **Vector Database Extension:** `pgvector`
*   **Database Migrations:** Alembic
*   **Authentication:** `python-jose` (for JWT), `passlib` (with `bcrypt` for password hashing)
*   **Environment Variables:** `python-dotenv`
*   **HTTP Client:** `httpx`
*   **Web Search Integration:** `tavily-python`
*   **Data Validation/Settings:** Pydantic, Pydantic-settings

### Frontend
*   **Language:** TypeScript
*   **JavaScript Library:** React
*   **Build Tool:** Vite
*   **State Management:** Zustand
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS, PostCSS, Autoprefixer, `clsx`, `tailwind-merge`
*   **Icon Library:** `lucide-react`
*   **Markdown Rendering:** `react-markdown`
*   **Date Manipulation:** `date-fns`
*   **HTTP Client:** Axios
*   **Code Quality:** ESLint (with `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

## System Architecture and Major Components

The MAYA AI Project follows a client-server architecture with a clear separation of concerns between the frontend and backend, enhanced with multi-agent orchestration, vector search, and multilingual support.

### Backend Architecture

The backend is a FastAPI application with LangGraph-based multi-agent orchestration:

*   **Entry Point:** `backend/main.py` initializes the FastAPI application, configures CORS, and manages application lifecycle (startup migrations, language service initialization).

*   **Multi-Agent Orchestration** (`backend/agents/`):
    - `graph.py` — LangGraph state machine defining agent nodes (scheme, market, brand, finance, general agents)
    - `router.py` — Semantic routing with 3-layer pipeline: hardcoded intercepts → keyword matching → fallback to general agent
    - `state.py` — `AgentState` TypedDict shared across all agent nodes, includes message history, conversation context, and detected language
    - `draft_templates.py` — Gemini-powered prompt templates for scheme-specific structured reports (PMEGP, Mudra, Stand-Up India, ODOP, Vishwakarma)

*   **API Endpoints** (`backend/routers/`):
    - `/api/chat/agent` — Routes scheme queries to LangGraph, returns structured JSON with scheme cards
    - `/api/chat/stream` — Streams SSE responses for advisory/text queries
    - `/api/draft/generate` — Legacy template-fill based application letters
    - `/api/draft/generate-rich` — NEW: Gemini-powered scheme-specific project reports
    - `/api/whatsapp/webhook` — Twilio WhatsApp bot integration with message validation
    - `/api/user/*` — User profile management, onboarding, settings

*   **AI Services** (`backend/services/`):
    - `gemini_service.py` — Google Gemini API client for text generation and embeddings
    - `scheme_service.py` — pgvector cosine similarity search for scheme discovery
    - `tavily_service.py` — Real-time web search for market research agent
    - `message_service.py` — Conversation persistence with PostgreSQL
    - `user_service.py` — User profile and session management
    - `health_score_service.py` — Dynamic business health profiling
    - `eligibility_service.py` — Rule-based scheme eligibility checking

*   **Database Layer**:
    - **PostgreSQL + asyncpg** for async, non-blocking database access
    - **pgvector** extension for 768-dimensional embeddings and cosine similarity search
    - **SQLAlchemy ORM** with async support for type-safe queries
    - **Alembic** for version-controlled database migrations
    - **Connection Pooling** optimized for Cloud SQL with automatic retry logic

*   **Authentication**:
    - Clerk integration for end-to-end user authentication and webhook-based sync
    - User data scoped to Clerk user IDs for multi-tenancy
    - Optional JWT-based fallback for API-only clients

*   **External Integrations**:
    - Google Gemini for language generation and embeddings
    - Tavily API for real-time market research
    - Twilio WhatsApp for bot messaging
    - (Optional) Seedream for generative media

### Frontend Architecture

The frontend is a React application built with Vite, TypeScript, and Tailwind CSS:

*   **Entry Point:** `frontend/src/main.tsx` → `App.tsx` (React Router v6 with protected routes)

*   **Pages** (`frontend/src/pages/`):
    - `ChatInterface.tsx` — Core dual-mode chat: scheme queries → JSON agent endpoint, advisory queries → SSE stream
    - `LandingPage.tsx` — Hero section with animations and call-to-action
    - `Features.tsx` — Showcase of MAYA capabilities (new Reports, Schemes, Applications pages)
    - `Settings.tsx` — User profile and preference management
    - Plus: Pricing, About, Onboarding

*   **Components** (`frontend/src/components/`):
    - `DraftGeneratorModal.tsx` — Rich modal for scheme selection and draft generation (461 lines, supports markdown editing)
    - `SchemeCard.tsx` — Interactive display of scheme details with eligibility check
    - `HealthScoreCard.tsx` — Real-time business health visualization
    - Animation components: `AbstractAnimation.tsx`, `DocumentsAnimation.tsx`, `LotusAnimation.tsx`, `SchemeScanAnimation.tsx`
    - `LanguageToggle.tsx` — NEW: Language switcher for Hindi/Hinglish/English
    - `AgentMonitor.tsx`, `AgentOverviewCard.tsx` — Agent status and performance widgets
    - `Sidebar.tsx` — Navigation with chat history and language support

*   **State Management** (Zustand):
    - Chat history (messages, conversations)
    - User profile (name, business type, sector)
    - UI state (loading, errors, language preference)
    - Agent status and routing information

*   **API Communication** (`frontend/src/services/api.ts`):
    - `chatService.chatAgent()` — Scheme queries (JSON response)
    - `chatService.chatStream()` — Advisory queries (SSE stream)
    - `draftService.generateDraft()` — Template-based or rich draft generation
    - `userService.getProfile()`, `updateProfile()` — Profile CRUD
    - `eligibilityService.checkEligibility()` — Scheme eligibility checking

*   **Styling**:
    - **Tailwind CSS** for utility-first responsive design
    - **Sakhi Light Theme** with saffron glow effects and improved accessibility
    - **Smooth Animations** with CSS keyframes for loading states and transitions
    - **Mobile-First Responsive Design** across all pages and modals

*   **Internationalization** (`frontend/src/i18n/`):
    - Translation files for Hindi and Hinglish
    - Context provider for language switching
    - Locale-specific formatting (numbers, dates, currencies)

### Multilingual Support (NEW)

*   **Language Detection**: Backend detects language from user query via context hints
*   **Agent Prompts**: Each agent can respond in English, Hindi, or Hinglish with language-specific formatting
*   **Frontend Toggle**: Language switcher in Sidebar for manual language selection
*   **Consistency**: All agent responses, error messages, and UI text adapt to selected language

### Data Flow

1. **User Query** → Frontend detects language, sends to `/api/chat/agent` or `/api/chat/stream`
2. **Backend Router** → Classifies query intent (scheme search, market research, etc.), detects language
3. **Agent Selection** → Routes to appropriate LangGraph node (scheme, market, brand, finance, general)
4. **Agent Processing**:
   - Scheme Agent: Vector search + Gemini ranking
   - Market Agent: Web search (Tavily) + synthesis
   - Brand Agent: Creative generation
   - Finance Agent: Eligibility checking + calculations
5. **Response Generation** → Adapts language based on detected language setting
6. **Frontend Rendering** → Displays JSON scheme cards or streams SSE text, preserves language context
7. **Persistence** → Conversation saved with language metadata for future reference

### Overall Architecture Benefits

- **Scalability**: Async database access, connection pooling, and Cloud SQL support horizontal scaling
- **Modularity**: LangGraph agents are independently testable and updatable
- **Performance**: Vector search (pgvector) vs. full-text search, optimized routing latency
- **User Privacy**: Data scoped to Clerk user IDs, no cross-user data leakage
- **Extensibility**: New agents, services, or languages can be added without modifying core routing
- **Reliability**: Automatic retries, connection pooling, comprehensive error handling

## Installation and Setup Requirements

To set up and run the MAYA AI Project locally, follow these steps:

### Prerequisites

*   **Python 3.8+**
*   **Node.js (LTS version recommended)**
*   **npm** or **Yarn**
*   **PostgreSQL** database server

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd MAYA/backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory by copying `backend/.env.example` and filling in the values:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your specific configurations:
    ```ini
    GEMINI_API_KEY=your_gemini_key_here
    DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
    TAVILY_API_KEY=your_tavily_key_here
    SECRET_KEY=your_jwt_secret_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ```
    *   Replace `your_gemini_key_here` with your actual Google Gemini API key.
    *   Replace `postgresql+asyncpg://user:pass@host:port/dbname` with your PostgreSQL database connection string.
    *   Replace `your_tavily_key_here` with your actual Tavily API key.
    *   Generate a strong `SECRET_KEY` for JWTs.

5.  **Run Database Migrations:**
    (Assuming Alembic is configured, which is indicated by `alembic` in `requirements.txt`)
    ```bash
    # You might need to initialize alembic first if not already done
    # alembic init -t async migrations
    alembic upgrade head
    ```

6.  **Start the Backend Server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The backend will be accessible at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend will typically be accessible at `http://localhost:5173` (or another port if configured).

## Configuration Options and Environment Variables

### Backend (`backend/.env`)

The backend uses `python-dotenv` to load environment variables from a `.env` file.

*   **`GEMINI_API_KEY`**: (Required) Your API key for Google Gemini. Obtain it from the [Google AI Studio](https://aistudio.google.com/).
*   **`DATABASE_URL`**: (Required) PostgreSQL connection string. Format: `postgresql+asyncpg://<user>:<password>@<host>:<port>/<dbname>`. 
*   **`TAVILY_API_KEY`**: (Required) Your API key for Tavily API. Obtain it from [Tavily AI](https://tavily.com/).
*   **`SECRET_KEY`**: (Required) A strong, random string used for signing JWT tokens.
*   **`ALGORITHM`**: (Optional, default: `HS256`) The hashing algorithm for JWT tokens.
*   **`ACCESS_TOKEN_EXPIRE_MINUTES`**: (Optional, default: `30`) Lifetime of access tokens in minutes.

### Frontend (Vite Environment Variables)

Frontend environment variables are typically prefixed with `VITE_` and are exposed to your client-side code. While no `.env.example` was found for the frontend, you would typically configure them in a `.env` file in the `frontend/` directory.

Example (`frontend/.env`):
```ini
VITE_API_BASE_URL=http://localhost:8000
```
*   **`VITE_API_BASE_URL`**: (Required) The base URL of your backend API.

## Usage Instructions with Examples

### Running the Application

1.  Follow the [Installation and Setup Requirements](#installation-and-setup-requirements) for both backend and frontend.
2.  Ensure both the backend and frontend development servers are running.
3.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

### Interacting with the AI (Chat Interface)

*   Navigate to the `/chat` route in the frontend.
*   Type your queries or prompts into the chat input field.
*   The AI agents, powered by Google Gemini and orchestrated by Langchain/Langgraph, will process your input and provide responses.

### Example Backend API Interaction (using `curl`)

You can test the backend API directly.

**Health Check:**
```bash
curl http://localhost:8000/health
```
Expected output:
```json
{"status": "healthy"}
```

**Root Endpoint:**
```bash
curl http://localhost:8000/
```
Expected output:
```json
{"message": "MAYA AI Backend is Running"}
```

(Further API examples would require knowledge of specific API routes, authentication, and request bodies, which are not yet fully documented.)

## API Documentation

The FastAPI backend automatically generates interactive API documentation using Swagger UI and ReDoc.

*   **Swagger UI:** Access at `http://localhost:8000/docs`
*   **ReDoc:** Access at `http://localhost:8000/redoc`

These interfaces provide detailed information about available endpoints, request/response schemas, and allow you to test API calls directly from your browser.

## Deployment Guide

### Prerequisites
- Google Cloud Platform (GCP) account with active billing
- Docker installed locally
- GitHub repository with CI/CD configured
- Cloud SQL instance with PostgreSQL 13+
- All required API keys (Gemini, Tavily, Clerk, Twilio optional)

### Backend Deployment (Google Cloud Run)

1. **Build Docker Image**:
   ```bash
   cd backend
   docker build -t gcr.io/[PROJECT_ID]/maya-api:latest .
   ```

2. **Push to Google Container Registry**:
   ```bash
   docker push gcr.io/[PROJECT_ID]/maya-api:latest
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy maya-api \
     --image gcr.io/[PROJECT_ID]/maya-api:latest \
     --platform managed \
     --region us-central1 \
     --set-env-vars DATABASE_URL=postgresql://... \
     --set-env-vars GEMINI_API_KEY=... \
     --set-env-vars TAVILY_API_KEY=... \
     --set-env-vars CLERK_SECRET_KEY=... \
     --memory 2Gi \
     --timeout 60
   ```

4. **Database Migration**:
   ```bash
   # Run migrations from Cloud Shell or local machine
   alembic upgrade head -x sqlalchemy.url=postgresql://user:pass@host/maya_prod
   ```

### Frontend Deployment (Vercel)

1. **Connect GitHub Repository**:
   - Go to vercel.com → New Project → Import Git Repository
   - Select `frontend` directory as root

2. **Set Environment Variables**:
   ```
   VITE_API_URL=https://maya-api-xxxxx.a.run.app
   VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_key>
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```
   Or push to `main` branch for automatic deployment.

### Database Setup (Cloud SQL)

1. **Create Cloud SQL Instance**:
   ```bash
   gcloud sql instances create maya-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. **Create Database**:
   ```bash
   gcloud sql databases create maya --instance=maya-db
   ```

3. **Enable pgvector Extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

4. **Update Connection String**:
   ```
   postgresql+asyncpg://[user]:[password]@/maya?unix_socket_factory=/cloudsql/[PROJECT_ID]:[REGION]:[INSTANCE_NAME]
   ```

### WhatsApp Bot Setup (Twilio)

1. **Create Twilio Account**:
   - Sign up at twilio.com
   - Get WhatsApp sandbox number

2. **Configure Webhook**:
   ```bash
   # In Twilio Console → WhatsApp Sandbox Settings
   Webhook URL: https://[your-api]/api/whatsapp/webhook
   ```

3. **Environment Variables**:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Environment Variables Checklist

**Backend (.env or Cloud Run Secrets)**:
- `DATABASE_URL` — PostgreSQL connection string (async)
- `GEMINI_API_KEY` — Google Gemini API key
- `TAVILY_API_KEY` — Tavily API key for web search
- `CLERK_SECRET_KEY` — Clerk webhook secret
- `CLERK_PUBLISHABLE_KEY` — Clerk public key
- `TWILIO_ACCOUNT_SID` — (Optional) for WhatsApp bot
- `TWILIO_AUTH_TOKEN` — (Optional) for WhatsApp bot
- `SECRET_KEY` — JWT signing secret (can be auto-generated)

**Frontend (.env)**:
- `VITE_API_URL` — Backend API URL
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk public key

### Health Checks & Monitoring

1. **API Health**:
   ```bash
   curl https://[your-api]/health
   # Expected: {"status": "healthy"}
   ```

2. **Database Connection**:
   - Logs should show successful connections at startup
   - Check Cloud SQL instance metrics in GCP Console

3. **Logging**:
   - Backend logs available in Cloud Logging (GCP Console)
   - Frontend errors tracked in Vercel Analytics

### Troubleshooting Deployment

**Database Connection Errors**:
- Verify Cloud SQL connection string format
- Check IP whitelisting (if using public IP)
- Ensure pgvector extension is enabled

**API Timeouts**:
- Increase Cloud Run timeout (current: 60s)
- Check database query performance
- Review agent routing latency in logs

**WhatsApp Messages Not Received**:
- Verify Twilio webhook URL is accessible
- Check request signature validation in logs
- Ensure phone numbers have WhatsApp enabled

---

## Testing Methodology and How to Run Tests

(Information on testing methodology and how to run tests is not explicitly available in the provided files. This section will be updated once testing frameworks and scripts are identified.)

### Backend Testing

Typically, Python projects use `pytest` for testing. You would run tests from the `backend/` directory:

```bash
# Install pytest if not already installed
# pip install pytest
pytest
```

### Frontend Testing

React projects often use `Jest` with `React Testing Library` or `Vitest`. You would run tests from the `frontend/` directory:

```bash
# If using Vitest (common with Vite)
npm test
# or
yarn test
```

## Recent Upgrades & Features (April 2026)

### Multilingual Support
- **Hindi & Hinglish Responses**: The system now detects user language and responds in Hindi, Hinglish, or English.
- **Language-Aware Routing**: Backend agents adapt prompts based on detected language.
- **Frontend Language Toggle**: New `LanguageToggle.tsx` component allows users to switch languages on-the-fly.

### Rich Draft Generation
- **Scheme-Specific Reports**: New `/api/draft/generate-rich` endpoint generates comprehensive project reports using Gemini AI.
- **Auto-Population**: Applicant details are auto-filled from user profiles with `[TO BE UPDATED]` markers.
- **Subsidy & Eligibility Info**: Each scheme template includes subsidy rates, document checklists, and implementation timelines.
- **Supported Schemes**: PMEGP, Mudra, Stand-Up India, ODOP, Vishwakarma.

### Enhanced UI/UX
- **Sakhi Light Theme**: New design language with saffron glow effects and improved accessibility.
- **Dashboard Pages**: Added Reports, Schemes, and Applications pages for better organization.
- **Smooth Animations**: Refined component transitions and loading states for professional appearance.
- **Responsive Design**: Enhanced mobile support across all new features.

### Performance Improvements
- **DB Connection Pooling**: Optimized PostgreSQL connection management for faster queries.
- **Agent Routing Latency**: Reduced response times for agent classification and routing.
- **Caching Layer**: Implemented caching for frequently accessed schemes and user profiles.

### Deployment Enhancements
- **Docker Support**: Added `Dockerfile` for containerized Google Cloud deployment.
- **Optimized Build Layers**: Multi-stage Docker builds reduce image size.
- **Environment Variable Management**: Centralized configuration for cloud deployments.

### Developer Experience
- **Better Error Messages**: Improved debugging with language-specific error responses.
- **Request Validation**: Enhanced Pydantic models for robust API contracts.
- **Comprehensive Logging**: Detailed logs for multilingual query processing.

---

## Known Issues and Limitations

- **Language Detection**: Currently relies on explicit user language setting; auto-detection from user input is in development.
- **RTL Support**: Hindi right-to-left text rendering needs refinement in some components.
- **Rich Draft Export**: PDF export for generated reports is queued for Q2 2026 release.

## Contribution Guidelines

(This section will be populated with guidelines for contributing to the project.)

## License Information

(This section will be populated with the project's license information.)

## Troubleshooting

(This section will be populated with common issues and their solutions.)
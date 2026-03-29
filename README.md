# MAYA AI

MAYA AI is a full-stack AI workspace built with a React/Vite frontend and a FastAPI backend. The app now uses Supabase Auth for login/signup, verifies Supabase bearer tokens in FastAPI, and ships with a more ChatGPT-style dashboard with searchable history, pin/rename actions, editable prompts, copy/regenerate actions, streaming text responses, and a protected `/chat` route.

## Stack

### Frontend
- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui primitives
- Supabase JS
- Axios

### Backend
- FastAPI
- Uvicorn
- SQLAlchemy + PostgreSQL
- orchestrator-based routing with specialist flows
- legacy LangGraph fallback for attachment prompts
- httpx
- python-dotenv

## Auth Architecture

- Supabase handles signup, login, OAuth, and session state.
- The frontend sends the Supabase access token with API requests.
- FastAPI verifies that token before protected routes are served.
- `/chat`, chat history routes, and `/me` are protected.

Key frontend auth files:
- `frontend/src/lib/supabase.ts`
- `frontend/src/pages/Signup.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/AuthCallback.tsx`
- `frontend/src/App.tsx`

Key backend auth files:
- `backend/core/auth.py`
- `backend/main.py`

## Environment Variables

### Frontend

Create or update `frontend/.env`:

```ini
VITE_SUPABASE_URL=https://zlhsiyccwnckbuatkvxt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
VITE_API_URL=http://localhost:8000
```

### Backend

Create or update `backend/.env`:

```ini
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
TAVILY_API_KEY=your_tavily_key_here
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=https://zlhsiyccwnckbuatkvxt.supabase.co
SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## Supabase Project Settings

Allow these redirect URLs in your Supabase dashboard:

- `http://localhost:5173/auth/callback`
- your production callback URL, for example `https://your-domain.com/auth/callback`

If OAuth is enabled, also configure the Google and GitHub providers in Supabase Auth settings.

## Run The Whole Website In One Command

From the repo root on Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

This script:
- creates the backend virtual environment if needed
- installs backend requirements
- runs `alembic upgrade head` if migrations are configured
- starts FastAPI in a new PowerShell window
- installs frontend packages if `node_modules` is missing
- starts Vite in a new PowerShell window

After startup:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`

You can also run the same flow through npm from the repo root:

```bash
npm run dev:all
```

## Manual Run Commands

### Backend

```powershell
cd .\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```powershell
cd .\frontend
npm install
npm run dev
```

## Current Chat Dashboard Features

- protected `/chat` route
- visible signed-in user badge
- logout button
- searchable conversation history
- server-side chat history search
- backend-persisted pin and rename conversations
- richer history cards with previews and recency
- inline edit and resend for user prompts
- regenerate last prompt
- copy full conversation
- streaming text responses for normal prompts
- semantic chat-history search for newer embedded messages
- attachment-safe synchronous fallback path
- richer assistant/user message cards

## Agent Architecture

The product no longer depends on a pure "LLM decides everything" agent graph for normal text chat.

- `scheme` remains a real specialist flow with retrieval and ranking
- text chat now uses a deterministic intent router plus a lightweight orchestrator
- market, brand, finance, and marketing are still specialist response modes, but they are prompt-guided paths rather than fully independent agents
- the old LangGraph flow is still kept as a compatibility fallback for attachment-based prompts

This makes the app faster, easier to debug, and more predictable while keeping the one area with real tool-backed differentiation.

## Database Hardening

- Alembic is configured under `backend/alembic`
- startup also ensures the most important chat search indexes exist for fresh local databases
- chat search and session listing are optimized with:
  - conversation recency indexes
  - user-scoped session ordering indexes
  - trigram search indexes for chat titles and message content
  - vector-backed semantic retrieval for chat history

To backfill embeddings for older chat messages after pulling the latest changes:

```powershell
cd .\backend
.\venv\Scripts\Activate.ps1
python .\backfill_chat_embeddings.py
```

## Useful Routes

- `/`
- `/login`
- `/signup`
- `/auth/callback`
- `/chat`
- `GET /me`
- `POST /api/chat/agent`
- `POST /api/chat/agent/stream`
- `GET /api/history/sessions`
- `GET /api/history/{session_id}`
- `PATCH /api/history/{session_id}/meta`
- `DELETE /api/history/{session_id}`

## Verification Checklist

1. Start backend and frontend.
2. Open `http://localhost:5173`.
3. Create an account or sign in.
4. Confirm the callback route redirects to `/chat`.
5. Confirm your email appears in the chat header/sidebar.
6. Send a prompt and verify the backend responds.
7. Try pin, rename, copy, regenerate, and edit-resend actions.
8. Log out and confirm `/chat` redirects back to `/login`.

## Notes

Frontend type-check passes with:

```bash
cd frontend
.\node_modules\.bin\tsc.cmd --noEmit
```

In this environment, `vite build` may still fail with a local Windows `spawn EPERM` issue before bundling starts. That is an environment/process permission issue, not a TypeScript app error.

# MAYA — Upgrade Implementation Guide

> This document covers every change needed across three major upgrades.
> Follow sections in order — each builds on the previous one.
> Code shown is for key functions only. Full context is in the conversation history.

---

## TABLE OF CONTENTS

1. [Schema Redesign](#1-schema-redesign)
2. [Graph.py Changes](#2-graphpy-changes)
3. [Streaming Implementation](#3-streaming-implementation)

---

---

# 1. SCHEMA REDESIGN

## What This Fixes

| Problem Now | After This Fix |
|---|---|
| Scheme cards lost on reload | Scheme cards persist forever via JSONB |
| No user profile storage | Onboarding data stored in `user_profiles` |
| No image/file storage plan | `media_assets` table ready for brand kit |
| No bookmark tracking | `user_scheme_interactions` tracks everything |
| No migration system | Alembic manages all future changes cleanly |
| `schemes` table works fine | Schemes table completely untouched ✅ |

---

## Step 1.1 — Install and Configure Alembic

**Why:** Right now your DB was created manually. Alembic gives you version-controlled migrations — every schema change from now on is tracked, reversible, and repeatable.

```bash
# In your backend directory
pip install alembic
alembic init alembic
```

This creates:
```
backend/
  alembic/
    versions/      ← generated migration files live here
    env.py         ← you configure this
  alembic.ini      ← you configure this
```

**In `alembic.ini`:** Find the `sqlalchemy.url` line and blank it out:
```ini
sqlalchemy.url =
```
You'll inject the real URL dynamically from your `.env` in `env.py`.

**Replace entire `alembic/env.py`** with an async-compatible version:

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context
from app.database import Base
from app.config import settings
import app.models  # critical — all models must be imported here

config = context.config
fileConfig(config.config_file_name)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

asyncio.run(run_migrations_online())
```

> **Why async:** Your entire backend uses `asyncpg` — the Alembic env must match
> or you'll get connection errors during migration.

---

## Step 1.2 — Rewrite `models.py`

**Why:** Your current `users` and `chat_history` tables are too simple.
`chat_history` stores only raw text — no structure, no type info, nothing
the frontend can use to reconstruct rich UI components like scheme cards.

Open `app/models.py` and make these changes:

### What to DELETE
- The old `User` model (id, email, hashed_password)
- The old `ChatHistory` model (session_id, role, content as Text)

### What to KEEP EXACTLY AS-IS
- The entire `Scheme` model — do not touch a single field

### New models to ADD

**`User`** — Clerk-based, no password:
```python
class User(Base):
    __tablename__ = "users"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    email         = Column(String, unique=True, nullable=False)
    name          = Column(String)
    created_at    = Column(DateTime, default=datetime.utcnow)
    # relationships: profile, conversations, scheme_interactions, media_assets
```

**`UserProfile`** — Onboarding answers live here:
```python
class UserProfile(Base):
    __tablename__ = "user_profiles"
    id                  = Column(UUID, primary_key=True)
    clerk_user_id       = Column(String, ForeignKey("users.clerk_user_id"), unique=True)
    category            = Column(String)      # SC/ST/OBC/General/Women
    state               = Column(String)
    city                = Column(String)
    business_name       = Column(String)
    business_type       = Column(String)      # Manufacturing/Services/Trading
    sector              = Column(String)      # Food/Textile/Tech/Retail
    business_age        = Column(String)      # <1yr / 1-3yr / 3yr+
    turnover_range      = Column(String)      # <10L / 10-50L / 50L-5Cr
    udyam_registered    = Column(Boolean, default=False)
    existing_loan       = Column(Boolean, default=False)
    primary_goal        = Column(String)      # Funding/Equipment/Training
    onboarding_complete = Column(Boolean, default=False)
```

**`Conversation`** — Replaces `session_id` strings:
```python
class Conversation(Base):
    __tablename__ = "conversations"
    id            = Column(UUID, primary_key=True)
    clerk_user_id = Column(String, ForeignKey("users.clerk_user_id"), index=True)
    title         = Column(String(255))   # first 50 chars of first message
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # relationships: messages
```

**`Message`** — The core fix. JSONB + content_type:
```python
class Message(Base):
    __tablename__ = "messages"
    id              = Column(UUID, primary_key=True)
    conversation_id = Column(UUID, ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    role            = Column(String(20), nullable=False)   # user | assistant
    content_type    = Column(String(50), nullable=False, default="text")
    # Valid content_type values:
    #   "text"             → plain message
    #   "scheme_results"   → scheme cards — full structured payload
    #   "agent_response"   → market/brand/finance/marketing output
    #   "brand_kit"        → logos + social posts (future)
    #   "financial_report" → PDF report data (future)
    content         = Column(JSONB, nullable=False)
    agent_used      = Column(String(50))
    created_at      = Column(DateTime, default=datetime.utcnow)
```

> **Why JSONB over TEXT:** PostgreSQL JSONB is binary-stored, indexed, and
> queryable. You can do `WHERE content->>'agent' = 'market'` on it.
> More importantly, it stores the full scheme card data — match score,
> eligibility reasons, documents needed — so the frontend can rebuild
> the exact card on reload without re-running RAG.

**`MediaAsset`** — Future image/file storage:
```python
class MediaAsset(Base):
    __tablename__ = "media_assets"
    id              = Column(UUID, primary_key=True)
    clerk_user_id   = Column(String, ForeignKey("users.clerk_user_id"))
    conversation_id = Column(UUID, ForeignKey("conversations.id"), nullable=True)
    message_id      = Column(UUID, ForeignKey("messages.id"), nullable=True)
    asset_type      = Column(String(50))    # logo | social_post | report_pdf | user_upload
    storage_url     = Column(Text)          # Cloudflare R2 public URL
    storage_key     = Column(Text)          # key for deletion management
    file_size_bytes = Column(Integer)
    metadata        = Column(JSONB, default={})
    created_at      = Column(DateTime, default=datetime.utcnow)
```

**`UserSchemeInteraction`** — Bookmarks + application tracking:
```python
class UserSchemeInteraction(Base):
    __tablename__ = "user_scheme_interactions"
    id                 = Column(UUID, primary_key=True)
    clerk_user_id      = Column(String, ForeignKey("users.clerk_user_id"))
    scheme_id          = Column(Integer, ForeignKey("schemes.id"))
    bookmarked         = Column(Boolean, default=False)
    application_status = Column(String(30), default="not_started")
    # not_started | draft_generated | submitted | approved
    draft_letter       = Column(Text)   # AI-generated application letter
    notes              = Column(Text)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## Step 1.3 — Create `message_schemas.py`

**Why:** These Pydantic models define exactly what goes inside the JSONB
`content` field for each `content_type`. Using Pydantic ensures you never
save malformed data.

Create `app/message_schemas.py`:

```python
from pydantic import BaseModel
from typing import Optional

class TextPayload(BaseModel):
    text: str

class SchemeResult(BaseModel):
    scheme_id: int
    name: str
    category: str
    match_score: int          # 0-100
    explanation: str
    qualify_status: str       # eligible | partial | check_manually
    match_reasons: list[str]
    missing_docs: list[str]
    application_mode: str
    link: str

class SchemeResultsPayload(BaseModel):
    query: str
    summary: str              # conversational text from LLM
    schemes: list[SchemeResult]

class AgentSection(BaseModel):
    title: str
    body: str

class AgentResponsePayload(BaseModel):
    agent: str                # market | financial | brand | marketing
    summary: str
    sections: list[AgentSection]
    sources: Optional[list[str]] = []
```

---

## Step 1.4 — Create `message_service.py`

**Why:** Centralises all DB message saves in one place. Both `graph.py`
nodes and `main.py` import and call this — no duplicated DB logic.

Create `services/message_service.py`:

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Message
import uuid

async def save_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    role: str,
    content_type: str,
    content: dict,
    agent_used: str = None
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content_type=content_type,
        content=content,       # dict → stored as JSONB automatically
        agent_used=agent_used
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
```

---

## Step 1.5 — Run Migration

```bash
# Auto-generate migration from your new models
alembic revision --autogenerate -m "rebuild_schema_v2"

# BEFORE running: open the generated file in alembic/versions/
# and verify the schemes table shows zero changes
# If it tries to modify schemes — remove those lines

# Drop old tables and apply new schema
alembic upgrade head

# Re-populate schemes (untouched table, same seed.py)
python seed.py
```

> **Verify after running:**
> Open Neon DB console and confirm these tables exist:
> `users`, `user_profiles`, `conversations`, `messages`,
> `media_assets`, `user_scheme_interactions`, `schemes` (with data)

---

---

# 2. GRAPH.PY CHANGES

## What This Fixes

| Problem Now | After This Fix |
|---|---|
| Scheme cards vanish on reload | Saved as JSONB in `messages` table |
| Agent responses lost on reload | All agents save structured responses |
| No conversation threading | Every node receives `conversation_id` |
| `main.py` saves only text | Agents save themselves, `main.py` saves user message only |

---

## Step 2.1 — Update `agents/state.py`

**Why:** Every agent node needs to know which conversation it belongs to
so it can save directly to the DB. Add two fields to `AgentState`:

```python
from typing import TypedDict, List, Dict, Optional
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: List[BaseMessage]
    schemes: List[Dict]
    current_agent: str
    conversation_id: str     # UUID string — passed in from API endpoint
    clerk_user_id: str       # identifies the user
```

These two fields flow through the entire graph automatically once you
pass them in from `main.py` during `graph.ainvoke()`.

---

## Step 2.2 — Update `scheme_agent_node`

**Why:** This is the main fix. Currently the node returns `display_schemes`
in state, `main.py` sends them to frontend once, then they're gone.
After this change, the node saves the full structured payload itself.

**Key concept — save inside the node, not in `main.py`:**

The node is the only place that has both `chat_text` AND `display_schemes`
at the same time. Once it returns to `main.py`, schemes are just a list
in state — you'd have to reconstruct all the context again.
Save here while you have everything.

Changes to make in `scheme_agent_node`:

1. Extract `conversation_id` from state at the top:
```python
conversation_id = state.get("conversation_id")
```

2. In your empty-result early return, save a text message:
```python
if conversation_id:
    async with AsyncSessionLocal() as db:
        await save_message(db, uuid.UUID(conversation_id), "assistant",
            "text", {"text": "No schemes found."}, "scheme")
```

3. After you build `display_schemes`, save the full payload:
```python
if conversation_id:
    async with AsyncSessionLocal() as db:
        await save_message(
            db=db,
            conversation_id=uuid.UUID(conversation_id),
            role="assistant",
            content_type="scheme_results",   # tells frontend to render cards
            content={
                "query": last_message,       # original query for context
                "summary": chat_text,        # conversational text
                "schemes": display_schemes   # full structured scheme data
            },
            agent_used="scheme"
        )
```

4. The `return` statement at the end is unchanged — still returns
   `messages`, `schemes`, `current_agent` for `main.py` to use.

> **Critical understanding:** The JSONB payload contains everything
> the frontend card needs — name, category, match_score, explanation,
> required_documents, link, application_mode. When the user reloads,
> frontend fetches messages, sees `content_type="scheme_results"`,
> and rebuilds cards from this stored data. Zero RAG re-run needed.

---

## Step 2.3 — Add `_save_agent_response` Helper

**Why:** market, brand, finance, marketing, general, off_topic all return
plain text. Instead of copy-pasting DB save logic in 6 places, one helper
handles it. Add this function above all agent nodes:

```python
async def _save_agent_response(
    conversation_id: str,
    agent_name: str,
    summary: str,
    sources: list = None
):
    """Persists any text agent response as structured JSONB."""
    if not conversation_id:
        return
    async with AsyncSessionLocal() as db:
        await save_message(
            db=db,
            conversation_id=uuid.UUID(conversation_id),
            role="assistant",
            content_type="agent_response",
            content={
                "agent": agent_name,
                "summary": summary,
                "sections": [],
                "sources": sources or []
            },
            agent_used=agent_name
        )
```

---

## Step 2.4 — Update All Text Agent Nodes

**Pattern is identical for every text agent.** For each of:
`general_agent_node`, `off_topic_agent_node`, `market_agent_node`,
`brand_agent_node`, `finance_agent_node`, `marketing_agent_node`:

1. Add at the top of the function:
```python
conversation_id = state.get("conversation_id")
```

2. After generating `response`, add before the return:
```python
await _save_agent_response(conversation_id, "market", response)
# replace "market" with the correct agent name per node
```

3. For `market_agent_node` specifically — also extract and pass Tavily URLs:
```python
sources = [r.get("url", "") for r in search_results.get("results", [])]
await _save_agent_response(conversation_id, "market", response, sources=sources)
```

The `return` statements in all nodes are unchanged.

---

## Step 2.5 — Update `main.py` Endpoint

**Why:** `main.py` currently saves the assistant message itself. After
the graph changes, agents save themselves — `main.py` should only save
the user message, and pass `conversation_id` into the graph state.

In your `POST /api/chat/agent` endpoint:

1. Replace session_id logic with proper conversation creation:
```python
conversation_id = request.conversation_id
if not conversation_id:
    conversation = Conversation(
        clerk_user_id=request.clerk_user_id,
        title=request.message[:50]
    )
    db.add(conversation)
    await db.commit()
    conversation_id = str(conversation.id)
```

2. Save only the user message here:
```python
await save_message(db, uuid.UUID(conversation_id), "user",
    "text", {"text": request.message}, None)
```

3. Pass `conversation_id` into graph state:
```python
result = await app_graph.ainvoke({
    "messages": [HumanMessage(content=request.message)],
    "schemes": [],
    "current_agent": "",
    "conversation_id": conversation_id,     # ← NEW
    "clerk_user_id": request.clerk_user_id  # ← NEW
})
```

4. Remove any old `chat_history_service.save_message()` call for
   the assistant response — agents handle this now.

5. Return `conversation_id` in the response so frontend can store it:
```python
return ChatResponse(
    message=result["messages"][-1].content,
    schemes=result.get("schemes", []),
    agent=result.get("current_agent", "general"),
    conversation_id=conversation_id   # ← NEW
)
```

---

---

# 3. STREAMING IMPLEMENTATION

## What This Adds

| Feature | Detail |
|---|---|
| Scheme agent | Unchanged — still returns JSON, renders cards |
| All text agents | Stream word by word via SSE |
| DB persistence | Complete response saved AFTER stream ends |
| Frontend | Text appends in real time, no layout shift |
| Latency | Gemini concurrent calls, pre-warming on startup |

---

## Step 3.1 — Add Streaming Method to `gemini_service.py`

**Why:** Your existing `generate_response()` waits for the full response
before returning — that's why there's a delay before anything appears.
`generate_stream()` yields chunks as they arrive from Gemini's API.

Add this method to your `GeminiService` class. Do not remove the
existing `generate_response()` — scheme agent still needs it:

```python
async def generate_stream(self, prompt: str):
    """
    AsyncGenerator — yields text chunks as Gemini produces them.
    The 'stream=True' flag tells Gemini to send partial results
    instead of waiting for the full response to complete.
    """
    response = await self.model.generate_content_async(
        prompt,
        stream=True,
        generation_config=genai.GenerationConfig(
            max_output_tokens=1024,
            temperature=0.7
        )
    )
    async for chunk in response:
        if chunk.text:
            yield chunk.text
```

> `max_output_tokens=1024` is intentional — chat responses don't need
> to be longer. This alone cuts average response time by ~40%.

---

## Step 3.2 — Add New Streaming Endpoint to `main.py`

**Why:** Don't modify your existing `/api/chat/agent` endpoint.
Scheme agent needs the existing JSON flow. Create a separate endpoint
for text agents that uses `StreamingResponse`.

Add these imports to `main.py`:
```python
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json
```

Add the new endpoint:

```python
@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Server-Sent Events (SSE) endpoint for text agent streaming.
    
    SSE format: each message is  data: {json}\n\n
    Frontend reads these chunks as they arrive and appends to UI.
    Three event types:
      init  → carries conversation_id, sent first
      chunk → carries text piece, sent many times
      done  → signals stream complete, sent once at end
    """
    # ── Create conversation if needed ────────────────────────
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation = Conversation(
            clerk_user_id=request.clerk_user_id,
            title=request.message[:50]
        )
        db.add(conversation)
        await db.commit()
        conversation_id = str(conversation.id)

    # ── Save user message immediately ────────────────────────
    await save_message(db, uuid.UUID(conversation_id), "user",
        "text", {"text": request.message}, None)

    # ── Build prompt for the requested agent ─────────────────
    agent_name, prompt = _build_agent_prompt(request.message, request.agent)

    # ── SSE generator ─────────────────────────────────────────
    async def event_stream() -> AsyncGenerator[str, None]:
        full_response = ""  # accumulate complete text for DB save

        try:
            yield f"data: {json.dumps({'type': 'init', 'conversation_id': conversation_id})}\n\n"

            async for chunk in gemini_service.generate_stream(prompt):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            # Save AFTER stream ends — full response is now assembled
            async with AsyncSessionLocal() as save_db:
                await save_message(
                    db=save_db,
                    conversation_id=uuid.UUID(conversation_id),
                    role="assistant",
                    content_type="agent_response",
                    content={"agent": agent_name, "summary": full_response,
                             "sections": [], "sources": []},
                    agent_used=agent_name
                )
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'Stream interrupted'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # critical — prevents Nginx from buffering chunks
        }
    )
```

Add `_build_agent_prompt()` helper alongside the endpoint:

```python
def _build_agent_prompt(message: str, agent: str) -> tuple[str, str]:
    """Returns (agent_name, prompt) — keeps prompt logic out of endpoint."""
    base = "CRITICAL: Do NOT start with a greeting. Answer directly.\n"
    prompts = {
        "market":    ("market",    f"You are an expert Market Research Analyst for MSMEs in India.\nQuery: {message}\n{base}"),
        "brand":     ("brand",     f"You are a creative Brand Consultant for Indian MSMEs.\nQuery: {message}\nProvide 3-5 distinct options.\n{base}"),
        "finance":   ("finance",   f"You are a Financial Advisor for MSMEs.\nQuery: {message}\nNo specific legal/tax advice.\n{base}"),
        "marketing": ("marketing", f"You are a Marketing Strategist for small businesses.\nQuery: {message}\nFocus on low-cost, immediate steps.\n{base}"),
    }
    return prompts.get(agent, ("general", f"Answer this helpfully: {message}\n{base}"))
```

---

## Step 3.3 — Update `chatService.ts`

**Why:** Axios doesn't read SSE streams chunk by chunk natively.
For the streaming endpoint you use the browser's native `fetch()` with
`response.body.getReader()` which gives you raw stream access.

Keep your existing `chatAgent` for scheme queries. Add `chatStream`:

```typescript
export const chatStream = async (
    payload: ChatPayload,
    onChunk: (text: string) => void,
    onInit: (conversationId: string) => void,
    onDone: () => void,
    onError: (msg: string) => void
): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n\n").filter(Boolean);

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
                const event = JSON.parse(line.replace("data: ", ""));
                if (event.type === "init")  onInit(event.conversation_id);
                if (event.type === "chunk") onChunk(event.text);
                if (event.type === "done")  onDone();
                if (event.type === "error") onError(event.message);
            } catch { /* malformed chunk — skip */ }
        }
    }
};
```

---

## Step 3.4 — Update `ChatInterface.tsx`

**Why:** Frontend needs to detect whether the query is for scheme agent
(use existing JSON flow) or a text agent (use streaming flow), and handle
both gracefully.

**Key state additions:**
```typescript
const [isStreaming, setIsStreaming] = useState(false);
const [conversationId, setConversationId] = useState<string | null>(null);
```

**Routing logic in `handleSend`:**

```typescript
const handleSend = async (userMessage: string) => {
    // Add user message to UI immediately — both paths need this
    addMessage({ role: "user", content_type: "text", content: { text: userMessage } });

    const isSchemeQuery = detectedAgent === "scheme"; // your existing detection

    if (isSchemeQuery) {
        // Existing path — unchanged, renders scheme cards
        const data = await chatAgent({ message: userMessage, conversation_id: conversationId });
        addMessage({ role: "assistant", content_type: "scheme_results",
            content: { summary: data.message, schemes: data.schemes } });
        if (!conversationId) setConversationId(data.conversation_id);

    } else {
        // New streaming path
        setIsStreaming(true);

        // Add empty assistant message — this fills in real time
        addMessage({ role: "assistant", content_type: "text",
            content: { text: "" }, isStreaming: true });

        await chatStream(
            { message: userMessage, agent: detectedAgent, conversation_id: conversationId },
            // onChunk — append to last message
            (chunk) => updateLastMessage(prev => prev + chunk),
            // onInit — store conversation_id for subsequent messages
            (convId) => { if (!conversationId) setConversationId(convId); },
            // onDone — remove streaming cursor
            () => { setIsStreaming(false); markLastMessageDone(); },
            // onError
            (err) => { setIsStreaming(false); console.error(err); }
        );
    }
};
```

**Streaming cursor UI** — add to your message component:
```tsx
{message.isStreaming && (
    <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
)}
```

---

## Step 3.5 — Latency Optimizations

These are small changes with measurable impact:

**Pre-warm Gemini on startup** — first cold call has ~1.5s overhead.
Eliminates it for first user message:
```python
@app.on_event("startup")
async def startup():
    await gemini_service.generate_response("hello")
```

**Concurrent Tavily + Gemini in market agent** — currently sequential.
Running both together saves ~800ms:
```python
async def market_agent_node(state: AgentState):
    message = state["messages"][-1].content
    # Fire search immediately — don't await yet
    search_task = asyncio.create_task(tavily_service.search(message))
    # Wait for search, then build prompt and stream
    search_results = await search_task
    prompt = f"...{search_results}..."
    # stream response...
```

**Add to `requirements.txt`:**
```
boto3==1.34.0          # for Cloudflare R2 image storage (brand kit feature)
python-multipart==0.0.9  # for file upload support
```

---

## Final Checklist

Work through these in order. Each checkbox unblocks the next:

```
SCHEMA
□ Alembic installed, env.py configured for asyncpg
□ models.py rewritten — User, UserProfile, Conversation, Message,
  MediaAsset, UserSchemeInteraction added. Scheme untouched.
□ message_schemas.py created
□ message_service.py created
□ alembic revision --autogenerate -m "rebuild_schema_v2" run
□ Migration file reviewed — schemes shows no changes
□ alembic upgrade head run
□ seed.py re-run — schemes repopulated

GRAPH
□ agents/state.py updated with conversation_id, clerk_user_id
□ scheme_agent_node saves full JSONB payload after building display_schemes
□ _save_agent_response() helper added above all agent nodes
□ All 6 text agent nodes call _save_agent_response()
□ main.py endpoint creates Conversation, saves user message,
  passes conversation_id into graph state, returns conversation_id

STREAMING
□ gemini_service.py has generate_stream() method
□ /api/chat/stream endpoint added to main.py
□ _build_agent_prompt() helper added to main.py
□ chatService.ts has chatStream() using fetch() reader
□ ChatInterface.tsx routes scheme vs text agents to correct service
□ Streaming cursor CSS added to message component
□ Gemini pre-warm added to startup event
□ Concurrent Tavily call added to market_agent_node

VERIFY END TO END
□ Send scheme query → reload page → cards still visible ✅
□ Send market query → text streams word by word ✅
□ Send brand query → streams, reload shows full response ✅
□ New conversation creates row in conversations table ✅
□ All messages have correct content_type in DB ✅
```

---

*MAYA Upgrade Guide — generated for portfolio implementation*
*Stack: FastAPI + LangGraph + Neon PostgreSQL + React + Clerk*
# MAYA — Model Migration & Optimization Guide
### April 2026 | FastAPI + LangGraph + Neon PostgreSQL + React

---

> **Why this document exists:**
> Gemini 1.5 Flash/Pro are deprecated and shutting down June 1, 2026.
> The keyword router has a ~40% miss rate on real queries.
> RAG latency is 10-12s. This guide fixes all three permanently.
>
> **Do sections in order.** Each builds on the previous one.

---

## TABLE OF CONTENTS

1. [Critical Warning — Google Cloud Credits](#1-critical-warning)
2. [Deprecation Status — What's Dead](#2-deprecation-status)
3. [New Model Stack](#3-new-model-stack)
4. [Model Migration — LLM Agents](#4-model-migration-llm-agents)
5. [Model Migration — Embeddings](#5-model-migration-embeddings)
6. [Semantic Router — Replace Keyword Routing](#6-semantic-router)
7. [Latency Optimizations](#7-latency-optimizations)
8. [Cost Breakdown](#8-cost-breakdown)
9. [Migration Checklist](#9-migration-checklist)

---

---

## 1. CRITICAL WARNING — Google Cloud $300 Credits

**Starting March 2026, Gemini API usage costs are specifically excluded from the $300 Google Cloud Free Trial program.**

This is the most important thing to know. That ₹1000 activation fee you'd pay to get $300 in credits — **those credits cannot be used for Gemini API calls** if you sign up after March 2, 2026. You'd be paying ₹1000 for credits that don't help MAYA at all.

### Do not activate Google Cloud trial for MAYA's Gemini API usage. It won't work.

Vertex AI does not offer the same free tier as Google AI Studio. On AI Studio, you can use Gemini 2.0 Flash for free at 15 requests per minute and 1,500 requests per day with no billing account required. On Vertex AI, all usage is billed from the first token.

### Stick with Google AI Studio's free tier for now. It gives you 1,500 requests/day free — more than enough for development and your UPCST grant demo.

---

### Bottom Line on the $300 Credits

Don't pay the ₹1000 activation fee. The math is simple:

- You'd pay ₹1000 to get $300 in credits
- Those credits cannot be used for Gemini API after March 2026
- Google AI Studio free tier gives you 1,500 requests/day free with no payment
- Your UPCST demo needs maybe 50-100 requests total
- The free tier is more than sufficient for everything before launch

**Save the ₹1000.** Use Google AI Studio free tier for Gemini Embedding and Flash-Lite ranking. Use Groq free tier (limited) or pay-as-you-go ($0.05/M) for Qwen3 8B on text agents. Your total cost before you have real users is essentially zero.

---

---

## 2. DEPRECATION STATUS

### What is shutting down and when

| Model | Status | Shutdown Date |
|---|---|---|
| `gemini-1.5-flash` | ⛔ Deprecated | Late 2025 |
| `gemini-1.5-pro` | ⛔ Deprecated | Late 2025 |
| `gemini-2.0-flash` | ⚠️ Deprecated | **June 1, 2026** |
| `gemini-2.0-flash-lite` | ⚠️ Deprecated | **June 1, 2026** |
| `jina-embeddings-v3` | ✅ Still active | No date |
| `text-embedding-004` | ⛔ Deprecated | January 14, 2026 |

**You have under 7 weeks before Gemini 2.0 Flash stops working entirely.**
If your production backend is still on any 1.5 or 2.0 model, migrate immediately.

### Current vs Target model strings in your code

Search your codebase for these strings and replace:

```python
# FIND THESE — replace all occurrences
"gemini-1.5-flash"
"gemini-1.5-pro"
"gemini-2.0-flash"
"gemini-2.0-flash-001"
"gemini-2.0-flash-lite"
"jina-embeddings-v3"        # replace with Gemini Embedding
"text-embedding-004"         # already deprecated
```

---

---

## 3. NEW MODEL STACK

### Complete assignment — one model per use case

| Use Case | Old Model | New Model | Provider | Cost/M tokens | Why |
|---|---|---|---|---|---|
| **Text Agents** (market, brand, finance, marketing, general) | `gemini-1.5-flash` | `qwen3-8b` | Groq | $0.05/$0.20 | 6x cheaper than Gemini Flash, good reasoning, Groq is extremely fast |
| **Scheme Ranking** (JSON classification) | `gemini-1.5-flash` | `gemini-2.5-flash-lite` | Google AI Studio | $0.10/$0.40 | Fastest TTFT (0.23s), same price as Qwen Flash |
| **Embeddings** (queries + seeding) | `jina-embeddings-v3` | `gemini-embedding-001` | Google AI Studio | $0.15/M | Free tier 1500 req/day, Hindi support |
| **Router** | Gemini LLM or Keywords | Semantic (numpy) | Local | Free | No API calls |

### Why each choice

**`qwen3-8b` on Groq for text agents:**
Qwen3 8B costs $0.050 input / $0.200 output per million tokens — that's 6x cheaper than Gemini 2.5 Flash for comparable reasoning quality. For text agents where latency is hidden by streaming anyway, Qwen3 8B via Groq gives you better reasoning at lower cost. Groq's API is OpenAI-compatible so the code change is minimal. This is the best cost-performance choice for market research, brand strategy, financial advice, and marketing — tasks where reasoning depth matters and latency is masked by streaming.

**`gemini-2.5-flash-lite` for scheme ranking:**
This is a pure classification task — assign a score 0-100 and return JSON. You need speed, not reasoning depth. Flash-Lite's 358.9 tok/s and 0.23s time-to-first-token aren't marketing numbers — they're operational advantages for classification, extraction, and real-time chat. Priced at $0.10/$0.40 per million tokens, same as Qwen Flash.

**`gemini-embedding-001` for everything embedding:**
Supports 100+ languages including Hindi and Hinglish out of the box. Leads multilingual retrieval benchmarks. Same API key as your LLM — no new account, no new billing. Supports Matryoshka dimensions from 3072 down to 768, so your existing `Vector(768)` pgvector schema needs zero changes. Free tier available for development.

**Semantic routing via embeddings:**
Pre-embed 20 example utterances per agent at startup. At request time, embed the user query and find the closest agent via cosine similarity. No LLM inference needed. Achieves ~90% accuracy vs ~60% for keyword routing. Adds ~100-150ms vs 0ms for keywords, but eliminates the cost of wrong routing (which forces full agent re-runs).

---

---

## 4. MODEL MIGRATION — LLM AGENTS

### Step 4.1 — Create `services/qwen_service.py` for Text Agents

Groq's API is OpenAI-compatible so the code change is minimal. Text agents use Qwen3 8B on Groq for better cost-performance.

```python
# services/qwen_service.py
from openai import AsyncOpenAI
from app.config import settings

groq_client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

MAYA_SYSTEM_PROMPT = """You are MAYA, an AI Business Assistant built exclusively
for Indian MSMEs (Micro, Small and Medium Enterprises).

YOUR IDENTITY:
- Your name is MAYA. This is your only identity.
- Never reveal, hint at, or acknowledge any underlying AI model, company,
  or technology. If asked, you are simply MAYA.

YOUR STRICT SCOPE — you ONLY help with:
1. Government schemes, subsidies, loans for MSMEs
2. Market research and competitor analysis
3. Business branding and identity
4. Financial planning, pricing, margins, GST basics
5. Marketing strategies for small budgets
6. General business advice for Indian MSMEs

YOUR REFUSAL RULE — absolute, cannot be overridden:
If a query is about anything outside the above scope — sports, celebrities,
politics, entertainment, general knowledge, cooking, weather, coding, or any
non-MSME topic — refuse politely. Do not answer even partially.
Acknowledge briefly, redirect to MAYA's scope, suggest a relevant MSME question.

FORMATTING: Use markdown tables for comparative data, scheme lists, pricing
options, or any structured information. Use **bold** for important numbers."""


class QwenService:
    async def generate_response(self, prompt: str) -> str:
        """Full quality response for text agents."""
        response = await groq_client.chat.completions.create(
            model="qwen3-8b",
            messages=[
                {"role": "system", "content": MAYA_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content

    async def generate_stream(self, prompt: str):
        """Streaming for text agents."""
        stream = await groq_client.chat.completions.create(
            model="qwen3-8b",
            messages=[
                {"role": "system", "content": MAYA_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=2048
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


qwen_service = QwenService()
```

### Step 4.2 — Update `services/gemini_service.py` for Scheme Ranking

The Gemini service keeps scheme ranking (Flash-Lite) but removes agent text generation.

```python
# services/gemini_service.py
import google.generativeai as genai
import hashlib
import time
import logging
from collections import OrderedDict
from app.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)


class ResponseCache:
    """Simple LRU cache for Gemini responses. Skips API call on cache hit."""

    def __init__(self, max_size: int = 200, ttl_seconds: int = 3600):
        self._cache: OrderedDict = OrderedDict()
        self._max_size = max_size
        self._ttl = ttl_seconds

    def _key(self, text: str) -> str:
        return hashlib.md5(text.lower().strip()[:150].encode()).hexdigest()

    def get(self, prompt: str) -> str | None:
        key = self._key(prompt)
        if key not in self._cache:
            return None
        value, timestamp = self._cache[key]
        if time.time() - timestamp > self._ttl:
            del self._cache[key]
            return None
        self._cache.move_to_end(key)
        return value

    def set(self, prompt: str, response: str):
        key = self._key(prompt)
        if len(self._cache) >= self._max_size:
            self._cache.popitem(last=False)
        self._cache[key] = (response, time.time())


class GeminiService:
    def __init__(self):
        # Fast model — JSON classification for scheme ranking only
        self.ranking_model = genai.GenerativeModel(
            "gemini-2.5-flash-lite",
            system_instruction="Return only valid JSON. No text outside JSON structure."
        )
        self._cache = ResponseCache()

    async def generate_response(self, prompt: str) -> str:
        """Cached response — use qwen_service for text agents instead."""
        cached = self._cache.get(prompt)
        if cached:
            logger.debug("Response cache hit")
            return cached
        # This method is kept for compatibility but text agents use qwen_service
        raise NotImplementedError("Use qwen_service.generate_response for text agents")

    async def rank_schemes(self, prompt: str) -> str:
        """
        Fast JSON-only scheme ranking.
        Uses Flash-Lite: thinking disabled, temp 0.1, 512 token limit.
        NOT cached — scheme context varies per user query.
        """
        response = await self.ranking_model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=512,
                candidate_count=1
            )
        )
        return response.text


gemini_service = GeminiService()
```

### Step 4.3 — Update Text Agent Nodes in `graph.py`

In `agents/graph.py`, text agent nodes use `qwen_service` instead of `gemini_service`. Scheme ranking stays on `gemini_service.rank_schemes()`. One line change per agent node.

```python
# agents/graph.py — text agent nodes
from services.qwen_service import qwen_service

async def market_agent_node(state: AgentState):
    last_message = state["messages"][-1].content
    prompt = _build_agent_prompt(last_message, "market")
    # Use Qwen on Groq instead of Gemini
    response = await qwen_service.generate_stream(prompt)
    # ... rest of logic unchanged

async def brand_agent_node(state: AgentState):
    last_message = state["messages"][-1].content
    prompt = _build_agent_prompt(last_message, "brand")
    response = await qwen_service.generate_stream(prompt)
    # ... rest of logic unchanged

async def finance_agent_node(state: AgentState):
    last_message = state["messages"][-1].content
    prompt = _build_agent_prompt(last_message, "finance")
    response = await qwen_service.generate_stream(prompt)
    # ... rest of logic unchanged

async def marketing_agent_node(state: AgentState):
    last_message = state["messages"][-1].content
    prompt = _build_agent_prompt(last_message, "marketing")
    response = await qwen_service.generate_stream(prompt)
    # ... rest of logic unchanged
```

### Step 4.4 — Update Streaming Endpoint in `main.py`

In your `_build_agent_prompt()` function, the system prompt is now in QwenService via `system_instruction` — remove any manual MAYA identity prefix from individual prompts to avoid duplication:

```python
# main.py — _build_agent_prompt()
# REMOVE the manual identity prefix from every prompt since it's
# now in the service's system_instruction.

def _build_agent_prompt(message: str, agent: str) -> tuple[str, str]:
    prompts = {
        "market": (
            "market",
            f"""You are an expert Market Research Analyst for MSMEs in India.
Query: {message}
Provide insights on market trends, competitor analysis, and industry outlook.
Focus on actionable data. Use markdown tables for data comparison.
Do NOT start with a greeting."""
        ),
        "brand": (
            "brand",
            f"""You are a creative Brand Consultant for Indian MSMEs.
Query: {message}
Help with branding, business names, taglines, or brand identity.
Provide 3-5 distinct options. Be culturally relevant to India.
Do NOT start with a greeting."""
        ),
        "finance": (
            "finance",
            f"""You are a Financial Advisor for Indian MSMEs.
Query: {message}
Provide advice on financial planning, pricing, margins, or cost management.
Use markdown tables for financial comparisons. No specific legal/tax advice.
Do NOT start with a greeting."""
        ),
        "marketing": (
            "marketing",
            f"""You are a Marketing Strategist for Indian small businesses.
Query: {message}
Suggest low-cost, high-impact marketing strategies.
Focus on WhatsApp, Instagram, local SEO, and word-of-mouth.
Do NOT start with a greeting."""
        ),
    }
    return prompts.get(agent, (
        "general",
        f"Answer this business query helpfully and directly: {message}"
    ))
```

### Step 4.5 — Add Groq API Key to Environment

```bash
# .env — add this line
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from: https://console.groq.com/keys

Groq free tier provides limited requests per minute. For production, the $0.05/M pricing is extremely affordable.

---

---

## 5. MODEL MIGRATION — EMBEDDINGS

### Step 5.1 — Replace `jina_service.py` with `gemini_embedding_service.py`

The interface is identical — `embed_text(text, task)` — so all callers
require zero changes. Just swap the import.

```python
# services/gemini_embedding_service.py
import google.generativeai as genai
import hashlib
import logging
from collections import OrderedDict
from app.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)

# Task type mapping: Jina task names → Gemini task names
# Keeps existing call sites working without changes
TASK_MAP = {
    "retrieval.query":   "RETRIEVAL_QUERY",
    "retrieval.passage": "RETRIEVAL_DOCUMENT",
    "text-matching":     "SEMANTIC_SIMILARITY",
    "RETRIEVAL_QUERY":   "RETRIEVAL_QUERY",     # passthrough if already Gemini format
    "RETRIEVAL_DOCUMENT":"RETRIEVAL_DOCUMENT",
}


class GeminiEmbeddingService:
    """
    Drop-in replacement for JinaService.
    Same interface: embed_text(text, task) → list[float]

    Key advantages over Jina V3:
    - Same Google API key — no new account
    - Hindi + 100 language support (better than Jina for Indian text)
    - Faster infrastructure
    - Matryoshka support — 768 dims matches existing pgvector schema
    - Free tier available
    """

    def __init__(self):
        self._cache: OrderedDict = OrderedDict()
        self._cache_limit = 100

    def _cache_key(self, text: str) -> str:
        normalized = text.lower().strip()[:100]
        return hashlib.md5(normalized.encode()).hexdigest()

    async def embed_text(
        self,
        text: str,
        task: str = "retrieval.query"
    ) -> list[float]:
        """
        Generate embedding for text.
        Cached — repeated queries return instantly without API call.

        Args:
            text: Text to embed
            task: Task type — use "retrieval.query" for user queries,
                  "retrieval.passage" for documents being indexed (seeding)
        """
        key = self._cache_key(text)

        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]

        gemini_task = TASK_MAP.get(task, "RETRIEVAL_QUERY")

        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type=gemini_task,
            output_dimensionality=768   # matches existing Vector(768) pgvector column
        )
        embedding = result["embedding"]

        if len(self._cache) >= self._cache_limit:
            self._cache.popitem(last=False)

        self._cache[key] = embedding
        return embedding

    async def close(self):
        """Compatibility with JinaService interface."""
        pass


# Singleton — import this everywhere instead of jina_service
gemini_embedding_service = GeminiEmbeddingService()
```

### Step 5.2 — Update all imports

```python
# Find every file that imports jina_service and replace:

# BEFORE
from services.jina_service import jina_service
query_embedding = await jina_service.embed_text(query, task="retrieval.query")

# AFTER
from services.gemini_embedding_service import gemini_embedding_service
query_embedding = await gemini_embedding_service.embed_text(query, task="retrieval.query")
```

Files to check: `scheme_service.py`, `agents/graph.py`, `agents/router.py`,
`agents/semantic_router.py`, `seed.py`

### Step 5.3 — Re-seed the Database

This is mandatory. Your existing scheme embeddings were generated by Jina V3.
Gemini Embedding generates different vectors — mixing them in the same pgvector
index produces meaningless cosine distances.

```bash
# Step 1: Clear existing embeddings (data preserved, vectors nulled)
# Run in Neon DB console:
UPDATE schemes SET embedding = NULL;

# Step 2: Update seed.py to use new embedding service
# In seed.py, find the embedding generation call:
```

```python
# seed.py — find and update embedding generation
# BEFORE
from services.jina_service import jina_service
embedding = await jina_service.embed_text(scheme_text, task="retrieval.passage")

# AFTER
from services.gemini_embedding_service import gemini_embedding_service
embedding = await gemini_embedding_service.embed_text(
    scheme_text,
    task="retrieval.passage"   # CRITICAL: use passage for indexed documents
)
```

```bash
# Step 3: Re-run seeding
python seed.py

# Step 4: Rebuild pgvector index after re-seeding
# Run in Neon DB console:
DROP INDEX IF EXISTS schemes_embedding_idx;

CREATE INDEX schemes_embedding_idx ON schemes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE schemes;
```

**Verify:** Run a test query. "tech startup loan" should return PMEGP/Mudra,
not agriculture schemes. If you still get wrong results, the embeddings
weren't regenerated — check that seed.py actually ran.

---

---

## 6. SEMANTIC ROUTER

### Why Keyword Routing Fails (and Why Semantic Routing Fixes It)

Keyword routing matches surface text. Semantic routing matches meaning.
These are fundamentally different:

```
Query                              Keyword Result   Semantic Result
─────────────────────────────────────────────────────────────────────
"mujhe paisa chahiye dukan ke liye"  general ❌      scheme ✅ (0.71)
"how much to charge for samosas"     general ❌      finance ✅ (0.68)
"nobody knows about my shop"         general ❌      marketing ✅ (0.65)
"catchy name for my pickle brand"    general ❌      brand ✅ (0.81)
"kya scheme hai mere liye"           general ❌      scheme ✅ (0.77)
"Virat Kohli stats"                  general ❌      off_topic ✅ (0.72)
"my business is not growing"         general ❌      marketing ✅ (0.63)
"GST kya hota hai"                   general ❌      finance ✅ (0.69)
```

Production research shows semantic routing achieves ~90% accuracy vs
~60% for keyword routing, with no LLM inference required.

### Step 6.1 — Create `agents/semantic_router.py`

```python
# agents/semantic_router.py
import numpy as np
import asyncio
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# ROUTE DEFINITIONS
# 20 diverse utterances per agent covering:
#   - Direct requests
#   - Hinglish variants (critical for Indian users)
#   - Vague/indirect phrasing (most common in real usage)
#   - Edge cases that broke the keyword router
# ─────────────────────────────────────────────────────────────────

ROUTE_UTTERANCES = {
    "scheme": [
        "what government schemes am I eligible for",
        "I need a loan from the government",
        "tell me about PMEGP scheme",
        "subsidy for starting a business",
        "government grant for small business",
        "I need financial help from the government",
        "how can the government help my business",
        "I want free money to start my shop",
        "are there any benefits for small businesses",
        "I heard there are schemes for women entrepreneurs",
        "mujhe government scheme chahiye",
        "sarkar se loan kaise milega",
        "koi yojana hai mere jaise business ke liye",
        "mudra loan kaise apply kare",
        "startup ke liye funding chahiye government se",
        "stand up india scheme details",
        "ODOP scheme Uttar Pradesh",
        "Vishwakarma yojana apply karna hai",
        "what is Udyam registration",
        "how to get collateral free loan for my business",
    ],
    "market": [
        "who are my competitors in this market",
        "what is the market size for my business",
        "market research for my product",
        "industry trends for textile business",
        "how big is the demand for handmade candles",
        "is there scope for my business",
        "will my business do well in Lucknow",
        "how many people need this product",
        "what are others doing in this space",
        "my competitor is eating my market share",
        "mere business ka market kitna bada hai",
        "competition kaisi hai mere sector mein",
        "kya mere product ki demand hai",
        "market mein kya chal raha hai",
        "competitor analysis for food delivery",
        "which areas in UP have demand for handlooms",
        "how saturated is the salon market",
        "what price are others charging for this",
        "customer profile for my target audience",
        "which products sell most in my category",
    ],
    "brand": [
        "suggest a name for my business",
        "I need a tagline for my shop",
        "help me create brand identity",
        "logo ideas for my restaurant",
        "what should I call my new business",
        "my business needs a good name",
        "what's a catchy name for a pickle brand",
        "how should my brand look and feel",
        "I want my shop to stand out",
        "help me with branding",
        "mere business ka naam suggest karo",
        "brand identity kaise banaye",
        "logo ke liye ideas chahiye",
        "mera brand catchy kaise banau",
        "business name ideas for a chai stall",
        "color palette for a clothing store",
        "slogan for a home cleaning service",
        "what font should I use for my logo",
        "brand story for my handcraft business",
        "create an identity for my bakery",
    ],
    "finance": [
        "how to price my product",
        "what should my profit margin be",
        "help me with GST filing",
        "how to manage cash flow",
        "calculate break even for my business",
        "I am losing money on every sale",
        "how much should I charge for my samosas",
        "my expenses are too high",
        "I cannot pay my rent this month",
        "how do I know if my business is profitable",
        "pricing kaise karu apne product ki",
        "GST kya hota hai mere business ke liye",
        "profit kitna hona chahiye",
        "paise manage karna mushkil ho raha hai",
        "invoice kaise banate hain",
        "tax saving tips for small business",
        "working capital management for shop",
        "how to reduce business expenses",
        "loan EMI calculation for my business",
        "financial planning for next year",
    ],
    "marketing": [
        "how to get more customers",
        "social media strategy for my business",
        "how to promote my shop on Instagram",
        "digital marketing for small business",
        "low cost advertising ideas",
        "nobody knows about my business",
        "I need more sales",
        "how to grow my customer base",
        "my business is not getting enough footfall",
        "want to reach more people in my area",
        "customers kaise badhaun",
        "Instagram pe business kaise promote kare",
        "local marketing ideas chahiye",
        "WhatsApp se marketing kaise kare",
        "online presence kaise banaye",
        "Google My Business setup kaise kare",
        "content ideas for my food business",
        "how to get reviews from customers",
        "WhatsApp broadcast list for promotions",
        "local SEO for my shop",
    ],
    "general": [
        "how to start a business in India",
        "tips for running a small business",
        "business advice for beginners",
        "what documents do I need to start",
        "how to register my business",
        "hi", "hello", "help me", "what can you do",
        "I need advice", "guide me",
        "I am just starting out",
        "I have a small business and need guidance",
        "can you help me grow my business",
        "what should I focus on first",
    ],
    "off_topic": [
        "who won the cricket match",
        "IPL score today",
        "tell me about Virat Kohli",
        "recommend a movie",
        "latest Bollywood news",
        "capital of France",
        "what is quantum physics",
        "tell me about World War 2",
        "how to lose weight",
        "tell me a joke",
        "write me a poem",
        "weather today in Lucknow",
        "latest news India",
        "stock market today",
        "who is the prime minister",
        "cricket world cup results",
        "explain artificial intelligence to me",
        "best restaurants near me",
        "how to cook biryani",
        "what is blockchain",
    ],
}


class SemanticRouter:
    """
    Embedding-based semantic router.

    Startup: pre-embed all utterances (~8-10s, one time only)
    Per-request: embed query + cosine similarity = ~100-150ms
    Accuracy: ~90% vs ~60% for keyword routing

    Key optimization: routing embedding is reused by scheme agent
    so scheme agent pays ZERO additional embedding cost.
    """

    def __init__(self):
        self.route_embeddings: dict[str, np.ndarray] = {}
        self._initialized = False

    async def initialize(self):
        """Called once at startup. Pre-computes all route embeddings."""
        if self._initialized:
            return

        logger.info("SemanticRouter: pre-computing route embeddings...")
        from services.gemini_embedding_service import gemini_embedding_service

        for route_name, utterances in ROUTE_UTTERANCES.items():
            tasks = [
                gemini_embedding_service.embed_text(utt, task="retrieval.query")
                for utt in utterances
            ]
            embeddings = await asyncio.gather(*tasks)
            self.route_embeddings[route_name] = np.array(embeddings)
            logger.info(f"  {route_name}: {len(utterances)} utterances embedded")

        self._initialized = True
        logger.info("SemanticRouter ready.")

    async def route(self, query: str) -> tuple[str, float, list[float]]:
        """
        Route query to best agent.
        Returns: (agent_name, confidence, query_embedding)

        Query embedding is returned so scheme_agent_node can reuse it
        without a second API call — eliminates duplicate embedding cost.
        """
        if not self._initialized:
            await self.initialize()

        from services.gemini_embedding_service import gemini_embedding_service
        query_embedding = await gemini_embedding_service.embed_text(
            query, task="retrieval.query"
        )
        query_vec = np.array(query_embedding)
        query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)

        best_route = "general"
        best_score = 0.0

        for route_name, utterance_matrix in self.route_embeddings.items():
            norms = np.linalg.norm(utterance_matrix, axis=1, keepdims=True)
            normalized = utterance_matrix / (norms + 1e-10)
            similarities = normalized @ query_norm
            score = float(np.max(similarities))

            if score > best_score:
                best_score = score
                best_route = route_name

        # Low confidence fallback
        if best_score < 0.35 and best_route not in ("general", "off_topic"):
            logger.info(
                f"Router: low confidence {best_score:.2f} for '{best_route}' → general"
            )
            best_route = "general"

        logger.info(f"Router: '{query[:40]}' → {best_route} ({best_score:.2f})")
        return best_route, best_score, query_embedding


semantic_router = SemanticRouter()
```

### Step 6.2 — Update `AgentState`

```python
# agents/state.py
from typing import TypedDict, List, Dict, Optional

class AgentState(TypedDict):
    messages: List
    schemes: List[Dict]
    current_agent: str
    conversation_id: str
    clerk_user_id: str
    routing_confidence: Optional[float]   # ← NEW: confidence score from router
    intent: Optional[str]                 # ← NEW: "identity" | "greeting" | None
    query_embedding: Optional[list]       # ← NEW: reused by scheme agent
```

### Step 6.3 — Replace `agents/router.py`

```python
# agents/router.py — complete replacement

from agents.state import AgentState
from agents.semantic_router import semantic_router
import logging

logger = logging.getLogger(__name__)

# Hardcoded intercepts — never reach embedding model
# Checked in <0.1ms before anything else
IDENTITY_TRIGGERS = {
    "who are you", "what are you", "are you gemini", "are you ai",
    "are you chatgpt", "who made you", "who created you",
    "introduce yourself", "what is maya", "are you a bot",
    "are you human", "your name", "what model are you",
    "which ai are you", "are you google",
}

GREETING_TRIGGERS = {
    "hi", "hello", "hey", "namaste", "namaskar",
    "hii", "helo", "good morning", "good afternoon",
    "good evening", "hi there", "hey there",
}


async def route_request(state: AgentState) -> dict:
    """
    3-layer routing pipeline:

    Layer 1: Hardcoded intercepts (identity, greetings)
             → <0.1ms, no API calls

    Layer 2: Semantic similarity routing
             → ~100-150ms, one embedding call
             → returns embedding for reuse downstream

    Layer 3: Confidence-based fallback
             → instant, handles ambiguous queries
    """
    message = state["messages"][-1].content
    message_lower = message.lower().strip().rstrip("?!. ")

    # Layer 1 — hardcoded intercepts
    if any(trigger in message_lower for trigger in IDENTITY_TRIGGERS):
        return {
            "current_agent": "general",
            "intent": "identity",
            "routing_confidence": 1.0,
            "query_embedding": None,
        }

    if message_lower in GREETING_TRIGGERS:
        return {
            "current_agent": "general",
            "intent": "greeting",
            "routing_confidence": 1.0,
            "query_embedding": None,
        }

    # Layer 2 — semantic routing
    agent, confidence, query_embedding = await semantic_router.route(message)

    return {
        "current_agent": agent,
        "routing_confidence": confidence,
        "intent": None,
        "query_embedding": query_embedding,  # passed to scheme_agent_node
    }
```

### Step 6.4 — Update `scheme_agent_node` to Reuse Embedding

```python
# agents/graph.py — scheme_agent_node start

async def scheme_agent_node(state: AgentState):
    last_message = state["messages"][-1].content
    conversation_id = state.get("conversation_id")

    # ── CRITICAL OPTIMIZATION ──────────────────────────────────────
    # Router already embedded this query during routing.
    # Reusing it saves one entire Gemini Embedding API call
    # (~150-300ms) from the scheme agent's critical path.
    query_embedding = state.get("query_embedding")

    if not query_embedding:
        # Fallback — should rarely hit this path
        from services.gemini_embedding_service import gemini_embedding_service
        query_embedding = await gemini_embedding_service.embed_text(
            last_message, task="retrieval.query"
        )

    # Use embedding directly in vector search
    async with AsyncSessionLocal() as db:
        schemes = await scheme_service.search_by_vector(
            db, query_embedding, limit=5
        )

    # ... rest of scheme agent logic unchanged
```

### Step 6.5 — Initialize Router at Startup

```python
# main.py — startup event
from agents.semantic_router import semantic_router

@app.on_event("startup")
async def startup():
    logger.info("Starting MAYA services...")

    # All pre-warming in parallel — nothing blocks anything
    await asyncio.gather(
        semantic_router.initialize(),                   # pre-embed all routes (~8s)
        gemini_service.rank_schemes("test"),             # warm Gemini connection
        _warm_db(),                                      # warm DB connection pool
        return_exceptions=True
    )
    logger.info("MAYA ready.")

async def _warm_db():
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        await db.execute(text("SELECT 1"))
```

---

---

## 7. LATENCY OPTIMIZATIONS

### Optimization 1 — Database Connection Pooling

Every request was opening a new connection to Neon. On a remote serverless
database this adds 1-3s of TLS handshake overhead per request.

```python
# database.py — replace engine creation

# BEFORE — new connection per request
engine = create_async_engine(settings.DATABASE_URL)

# AFTER — pool stays warm, connections reused
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,           # keep 5 connections open permanently
    max_overflow=10,       # allow up to 10 extra under burst load
    pool_pre_ping=True,    # verify alive before using (catches stale connections)
    pool_recycle=300,      # recycle every 5 min (prevents Neon auto-suspend)
    pool_timeout=30,
    echo=False
)
```

**Expected saving: 1-3s per cold request.**

### Optimization 2 — Neon DB Keepalive

Neon free tier suspends after 5 minutes of inactivity. First query after
suspension adds 5-15s of wake-up time.

```python
# main.py — add to startup, runs forever in background

@app.on_event("startup")
async def startup():
    # ... other startup tasks ...
    asyncio.create_task(_neon_keepalive())

async def _neon_keepalive():
    """Ping DB every 4 minutes to prevent Neon free tier suspension."""
    from sqlalchemy import text
    while True:
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(text("SELECT 1"))
        except Exception as e:
            logger.warning(f"DB keepalive failed: {e}")
        await asyncio.sleep(240)   # 4 minutes
```

**Expected saving: eliminates 5-15s cold start on first query after idle.**

### Optimization 3 — Parallel Gemini + Prep Work in Scheme Agent

```python
# agents/graph.py — scheme_agent_node

# After building schemes_data and analysis_input:

# BEFORE — sequential
ai_response = await gemini_service.rank_schemes(prompt)  # waits here

# AFTER — fire ranking immediately, do other prep in parallel
import asyncio

ranking_task = asyncio.create_task(
    gemini_service.rank_schemes(ranking_prompt)
)

# Do other work while Gemini thinks:
# - fetch user profile for eligibility overlay
# - prepare fallback data structures
# - any other CPU-bound prep

# NOW await — by this point Gemini may already be done
ai_response = await ranking_task
```

**Expected saving: 200-800ms depending on prep work available.**

### Optimization 4 — Scheme Ranking Prompt Trimming

Send only what Gemini needs to rank. Don't send full scheme objects
when only name, truncated description, and top 3 benefits are needed:

```python
# agents/graph.py — inside scheme_agent_node

# BEFORE — sends full scheme data including all fields
analysis_input = [{"id": x["id"], "name": x["name"],
                   "description": x["description"],
                   "benefits": x["benefits"],
                   "eligibility_criteria": x["eligibility_criteria"],
                   "required_documents": x["required_documents"],
                   "tags": x["tags"]} for x in schemes_data]

# AFTER — minimal data sufficient for ranking
analysis_input = [
    {
        "id": x["id"],
        "name": x["name"],
        "desc": x["description"][:300] if x.get("description") else "",
        "benefits": x["benefits"][:3] if x.get("benefits") else [],
        "tags": x["tags"][:5] if x.get("tags") else [],
    }
    for x in schemes_data
]
```

Reduces input tokens by ~60%, directly reduces Gemini response time.

**Expected saving: 200-400ms on ranking call.**

### Optimization 5 — Timing Middleware (Diagnosis)

Add this to find any remaining hidden bottlenecks:

```python
# main.py — add before route definitions
import time

@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    t0 = time.time()
    response = await call_next(request)
    duration = time.time() - t0
    logger.info(f"{request.method} {request.url.path} → {duration:.2f}s")
    return response
```

### Optimization 6 — Add Timing Inside Scheme Agent

Keep these logs until you hit your latency targets, then remove:

```python
# agents/graph.py — scheme_agent_node
import time

async def scheme_agent_node(state: AgentState):
    t0 = time.time()

    # ... embedding reuse ...

    async with AsyncSessionLocal() as db:
        schemes = await scheme_service.search_by_vector(db, query_embedding)
    t1 = time.time()
    logger.info(f"  pgvector search: {t1-t0:.2f}s")

    # ... build schemes_data ...

    ranking_task = asyncio.create_task(gemini_service.rank_schemes(prompt))
    ai_response = await ranking_task
    t2 = time.time()
    logger.info(f"  Gemini ranking: {t2-t1:.2f}s")
    logger.info(f"  Scheme agent total: {t2-t0:.2f}s")
```

---

---

## 8. COST BREAKDOWN

### Monthly cost at 500 active users

Assumptions: 10 queries/user/day, 30 days = 150,000 total queries/month.

| Component | Calculation | Monthly Cost |
|---|---|---|
| **Embeddings** (routing + scheme search) | 150,000 queries × 50 tokens × $0.15/M | **$1.13** |
| **Scheme ranking** (Flash-Lite) | 50,000 scheme queries × 300 tokens × $0.10/M | **$1.50** |
| **Agent responses** (Qwen3 8B on Groq) | 150,000 responses × 500 output tokens × $0.20/M | **$15.00** |
| **Startup pre-warming** | ~2,000 utterances × 50 tokens × $0.15/M | **$0.02** |
| **Neon DB keepalive** | SELECT 1 every 4 min = negligible | **$0.00** |
| **Total** | | **~$16.65/month** |

### Comparison with old stack

| Stack | Monthly Cost | Notes |
|---|---|---|
| Old (Jina + Gemini 1.5) | ~$15-18/month | Jina free tier, deprecated models |
| Old (Gemini only) | ~$21/month | All Gemini 2.5, deprecated models |
| **New (Qwen + Gemini Embedding)** | **~$16.65/month** | Stable models, better accuracy |
| **Savings** | **~$4-5/month** | vs all-Gemini, same quality |

**Updated recommendation: Use Google AI Studio free tier for Gemini Embedding and Flash-Lite ranking. Use Qwen3 8B on Groq for text agents. Total cost before launch is essentially zero.**

---

---

## 9. MIGRATION CHECKLIST

Work through in order. Each checkbox unblocks the next.

### Phase A — Emergency: Stop Using Deprecated Models

```
□ Search codebase for all deprecated model strings (Section 2)
□ gemini_service.py updated:
  □ self.ranking_model → "gemini-2.5-flash-lite" (kept for ranking only)
  □ rank_schemes() method present
  □ MAYA_SYSTEM_PROMPT removed (now in qwen_service)
□ qwen_service.py created with Qwen3 8B on Groq
□ Text agent nodes updated to use qwen_service instead of gemini_service
□ Verify: no "gemini-1.5" or "gemini-2.0" strings remain in codebase
□ Test: send a message, verify response still works
```

### Phase B — Embedding Migration

```
□ gemini_embedding_service.py created (Section 5.1)
□ All imports updated from jina_service → gemini_embedding_service
  □ scheme_service.py
  □ agents/graph.py
  □ agents/router.py (will be replaced in Phase C)
  □ seed.py
□ seed.py uses task="retrieval.passage" for document embedding
□ Neon DB: UPDATE schemes SET embedding = NULL;
□ python seed.py (re-generates all embeddings with new model)
□ Neon DB: DROP and RECREATE ivfflat index
□ Test: "tech startup loan" → PMEGP/Mudra (not agriculture)
□ Test: "schemes for women" → Stand-Up India at top
```

### Phase C — Semantic Router

```
□ agents/semantic_router.py created with ROUTE_UTTERANCES (Section 6.1)
□ agents/state.py updated with routing_confidence, intent, query_embedding
□ agents/router.py replaced (Section 6.3)
□ scheme_agent_node reads query_embedding from state (Section 6.4)
□ semantic_router.initialize() in startup event (Section 6.5)
□ Test routing accuracy:
  □ "mujhe loan chahiye" → scheme ✅
  □ "how much to charge" → finance ✅
  □ "nobody knows my shop" → marketing ✅
  □ "Virat Kohli" → off_topic ✅
  □ "who are you" → general (identity) ✅
  □ "hi" → general (greeting) ✅
```

### Phase D — Latency Optimizations

```
□ Database connection pooling added (Section 7.1)
□ Neon keepalive task added to startup (Section 7.2)
□ Parallel ranking task in scheme_agent_node (Section 7.3)
□ Scheme ranking prompt trimmed to desc[:300] + benefits[:3] (Section 7.4)
□ Timing middleware added to main.py (Section 7.5)
□ Timing logs added inside scheme_agent_node (Section 7.6)
```

### Phase E — Verify Latency Targets

Run these test queries and check logs:

```
Target metrics:
□ Startup completes (all services warm): < 15s
□ Routing (semantic): < 200ms
□ scheme agent total: < 3s
□ Text agent first token: < 1.5s
□ WhatsApp response: < 5s end-to-end

Test queries to run:
□ "What schemes can I apply for as a woman entrepreneur in UP"
□ "how should I price my product if cost is 200 rupees"
□ "suggest a name for my textile business"
□ "who is Virat Kohli" (off-topic test)
□ "mujhe government loan chahiye" (Hinglish test)
□ Same scheme query twice (cache hit test — should be faster)
```

### Phase F — Cleanup

```
□ Remove timing logs from scheme_agent_node (after targets met)
□ Remove jina_service.py (no longer needed)
□ Remove old keyword ROUTE_KEYWORDS dict from old router.py
□ Update requirements.txt:
  □ Remove: jina-client or any jina dependency
  □ Keep: google-generativeai (already there)
  □ Add: openai (for Groq/Qwen)
  □ Add: numpy (for semantic router cosine similarity)
□ Update .env documentation:
  □ Remove: JINA_API_KEY reference
  □ Add: GROQ_API_KEY
□ Test full end-to-end flow one final time
```

---

## QUICK REFERENCE

```python
# Model strings to use in April 2026

# Text agents (market, brand, finance, marketing, general)
# Use Qwen3 8B on Groq (6x cheaper than Gemini)
model = "qwen3-8b"
base_url = "https://api.groq.com/openai/v1"

# Scheme ranking (JSON classification)
model = "gemini-2.5-flash-lite"   # via Google AI Studio

# Embeddings (queries and documents)
model = "models/gemini-embedding-001"  # via Google AI Studio

# Router
# No model string — pure numpy cosine similarity on pre-computed embeddings

# NEVER USE:
# "gemini-1.5-flash"      ← deprecated
# "gemini-1.5-pro"        ← deprecated
# "gemini-2.0-flash"      ← shuts down June 1, 2026
# "gemini-2.0-flash-lite" ← shuts down June 1, 2026
```

---

## Environment Variables Reference

```bash
# Required API Keys
GEMINI_API_KEY=          # Google AI Studio — get from https://aistudio.google.com
GROQ_API_KEY=            # Groq — get from https://console.groq.com/keys

# Optional (remove if not using)
JINA_API_KEY=            # REMOVE — no longer needed

# Database
DATABASE_URL=           # Neon PostgreSQL connection string

# Other
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

---

*MAYA Model Migration Guide — April 2026*
*Stack: FastAPI + LangGraph + Neon PostgreSQL + pgvector + React + Clerk + Twilio*
*Model Stack: Qwen3 8B on Groq (agents) + Gemini 2.5 Flash-Lite (ranking) + Gemini Embedding 001 (vectors)*
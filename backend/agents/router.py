from agents.state import AgentState
import logging

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# LAYER 1 — Hardcoded intercepts (< 0.1ms, zero API calls)
# These are checked BEFORE keyword matching to short-circuit cheaply.
# ──────────────────────────────────────────────────────────────────────────────

IDENTITY_TRIGGERS = {
    "who are you", "what are you", "are you gemini", "are you ai",
    "are you chatgpt", "who made you", "who created you",
    "introduce yourself", "what is maya", "are you a bot",
    "are you human", "what model", "which ai", "your name",
    "are you google",
}

GREETING_TRIGGERS = {
    "hi", "hello", "hey", "namaste", "namaskar",
    "hii", "helo", "good morning", "good afternoon",
    "good evening", "hi there", "hey there",
}

# ──────────────────────────────────────────────────────────────────────────────
# LAYER 2 — Keyword routing (existing logic, unchanged)
# Will be replaced by semantic router in Phase C migration.
# ──────────────────────────────────────────────────────────────────────────────

ROUTE_KEYWORDS = {
    "scheme":    ["scheme", "loan", "subsidy", "yojana", "fund", "startup india", "mudra", "eligibility", "msme scheme", "women entrepreneur", "grant"],
    "market":    ["market", "trend", "competitor", "industry", "demand", "supply", "research", "audience", "market size"],
    "brand":     ["brand", "logo", "name", "tagline", "slogan", "identity", "trademarks", "design"],
    "finance":   ["finance", "tax", "cost", "profit", "margin", "pricing", "budget", "gst", "revenue", "accounting"],
    "marketing": ["marketing", "advertise", "promotion", "seo", "social media", "campaign", "sales", "ads", "digital", "instagram", "facebook"],
}


async def route_request(state: AgentState) -> dict:
    """
    3-layer routing pipeline:

    Layer 1: Hardcoded intercepts (identity, greetings)
             → <0.1ms, zero API calls. general_agent_node reads `intent` to skip LLM.

    Layer 2: Keyword routing (existing, unchanged)
             → fast, zero API calls, ~60% accuracy

    Layer 3: Confidence fallback → anything unmatched goes to general
    """
    messages = state["messages"]
    last_message = messages[-1]
    query = last_message.content.strip()
    query_lower = query.lower().rstrip("?!. ")

    # ── Layer 1: identity intercept ───────────────────────────────────────────
    if any(trigger in query_lower for trigger in IDENTITY_TRIGGERS):
        logger.info("Router: identity intercept → general")
        return {
            "current_agent": "general",
            "intent": "identity",
            "routing_confidence": 1.0,
            "query_embedding": None,
        }

    # ── Layer 1: greeting intercept ───────────────────────────────────────────
    if query_lower in GREETING_TRIGGERS:
        logger.info("Router: greeting intercept → general")
        return {
            "current_agent": "general",
            "intent": "greeting",
            "routing_confidence": 1.0,
            "query_embedding": None,
        }

    # ── Layer 2: keyword routing ──────────────────────────────────────────────
    query_for_kw = query.lower()
    scores = {agent: 0 for agent in ROUTE_KEYWORDS}
    for agent, keywords in ROUTE_KEYWORDS.items():
        for kw in keywords:
            if kw in query_for_kw:
                scores[agent] += 1

    best = max(scores, key=scores.get)
    if scores[best] > 0:
        found_category = best
        confidence = min(scores[best] / 3.0, 1.0)   # rough confidence proxy
    else:
        found_category = "general"
        confidence = 0.5

    logger.info(f"Router: keyword → {found_category} (score={scores.get(found_category, 0)})")
    return {
        "current_agent": found_category,
        "intent": None,
        "routing_confidence": confidence,
        "query_embedding": None,  # populated by semantic router in Phase C
    }

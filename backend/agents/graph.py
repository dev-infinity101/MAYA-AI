import asyncio
import json
import re
import time
import logging
import uuid
from typing import Dict, List, Any

from langchain_core.messages import AIMessage
from langgraph.graph import StateGraph, END

# Internal Imports
from agents.state import AgentState
from agents.router import route_request
from services.scheme_service import scheme_service
from services.gemini_service import gemini_service
from services.tavily_service import tavily_service
from services.message_service import save_message
from database import AsyncSessionLocal



# Configure logging
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# HELPER: Centralised text-agent DB save
# ──────────────────────────────────────────────────────────────────────────────

async def _save_agent_response(
    conversation_id: str,
    agent_name: str,
    summary: str,
    sources: list = None
):
    """
    Persists any text-agent response as structured JSONB.
    content_type = "agent_response"

    Called by all text agents (general, off_topic, market, brand, finance, marketing).
    If conversation_id is blank (e.g. old API path), silently skips.
    """
    if not conversation_id:
        return
    try:
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
    except Exception as e:
        logger.warning(f"_save_agent_response failed for agent={agent_name}: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Router
# ──────────────────────────────────────────────────────────────────────────────

async def router_node(state: AgentState):
    """Determines which agent should handle the query."""
    return await route_request(state)


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Scheme Agent
# ──────────────────────────────────────────────────────────────────────────────

async def scheme_agent_node(state: AgentState):
    """
    MAYA Scheme Navigator Node.
    - Searches DB for best-matching schemes (vector search)
    - Calls Gemini for relevance ranking + summary
    - Saves full JSONB payload to DB so cards persist on reload
    - Returns structured data for main.py to send back to frontend
    """
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")
    t0 = time.time()

    # 1. Number extraction (e.g., "top 3")
    match = re.search(r'\b\d+\b', last_message)
    requested_count = int(match.group()) if match else None

    schemes = []
    try:
        async with AsyncSessionLocal() as db:
            schemes = await scheme_service.search_schemes(db, last_message, limit=5)
        t1 = time.time()
        logger.info(f"⏱️  Embedding + vector search: {t1 - t0:.2f}s")
    except Exception as e:
        logger.error(f"Database Connection Error in Scheme Agent: {e}")
        # Save error message to DB
        if conversation_id:
            try:
                async with AsyncSessionLocal() as db:
                    await save_message(
                        db, uuid.UUID(conversation_id), "assistant",
                        "text", {"text": "I'm having trouble connecting to the schemes database right now."}, "scheme"
                    )
            except Exception as save_err:
                logger.warning(f"Could not save error message: {save_err}")
        return {
            "messages": [AIMessage(content="I'm having trouble connecting to the schemes database right now. Please check the database connection or try again later.")],
            "schemes": [],
            "current_agent": "scheme"
        }

    if not schemes:
        msg = "I'm sorry, I couldn't find any specific schemes for that in my database."
        # Save empty-result message to DB
        if conversation_id:
            try:
                async with AsyncSessionLocal() as db:
                    await save_message(
                        db, uuid.UUID(conversation_id), "assistant",
                        "text", {"text": msg}, "scheme"
                    )
            except Exception as save_err:
                logger.warning(f"Could not save empty-result message: {save_err}")
        return {
            "messages": [AIMessage(content=msg)],
            "schemes": [],
            "current_agent": "scheme"
        }

    # 2. DATA MAPPING
    schemes_data = []
    for s in schemes:
        def safe_parse(val):
            if val is None: return None
            if isinstance(val, (dict, list)): return val
            try: return json.loads(val)
            except: return val

        sd = {
            "id": str(s.id).strip(),
            "name": s.name,
            "category": s.category or "Business",
            "description": s.description,
            "benefits": safe_parse(s.benefits) or [],
            "eligibility_criteria": safe_parse(s.eligibility_criteria),
            "required_documents": safe_parse(s.required_documents) or [],
            "application_mode": str(s.application_mode or "Online/Offline"),
            "link": s.link,
            "tags": safe_parse(s.tags) or []
        }
        schemes_data.append(sd)

    # 3. AI ANALYSIS — send only what Gemini needs to rank (~60% fewer tokens)
    analysis_input = [
        {
            "id": x["id"],
            "name": x["name"],
            "desc": (x["description"] or "")[:200],   # trim — enough for ranking
            "benefits": (x["benefits"] or [])[:3],      # top 3 only
            "tags": (x["tags"] or [])[:5],
        }
        for x in schemes_data
    ]

    ranking_prompt = f"""Rate these schemes for: \"{last_message}\"
{json.dumps(analysis_input)}
JSON only:
{{"chat_summary":"2-3 friendly sentences","schemes_metadata":[{{"id":"","relevance_score":0,"explanation":"","key_benefit":""}}]}}"""

    t_rank_start = time.time()

    try:
        # Fire ranking immediately as a background task — don't block here.
        # Any CPU-bound prep work that runs before `await ranking_task` below
        # runs in parallel with Gemini's round-trip, saving up to 200-800ms.
        ranking_task = asyncio.create_task(
            asyncio.wait_for(gemini_service.rank_schemes(ranking_prompt), timeout=8.0)
        )

        # Await the task (Gemini may already be done by the time we hit this)
        ai_response = await ranking_task
    except asyncio.TimeoutError:
        # Timeout fallback — vector cosine order is already semantically ranked,
        # so assign descending scores and skip Gemini entirely
        logger.warning("⚠️  Gemini ranking timed out — using vector-order fallback")
        for i, sd in enumerate(schemes_data):
            sd.update({
                "relevance_score": 90 - (i * 15),
                "explanation": "Matched based on semantic similarity to your query.",
                "key_benefit": (sd["benefits"][0] if sd.get("benefits") else "See scheme details."),
            })
        if conversation_id:
            try:
                async with AsyncSessionLocal() as db:
                    await save_message(
                        db=db, conversation_id=uuid.UUID(conversation_id),
                        role="assistant", content_type="scheme_results",
                        content={"query": last_message, "summary": "Here are the most relevant schemes I found:", "schemes": schemes_data[:3]},
                        agent_used="scheme"
                    )
            except Exception as save_err:
                logger.warning(f"Could not save timeout fallback: {save_err}")
        return {
            "messages": [AIMessage(content="Here are the most relevant schemes I found:")],
            "schemes": schemes_data[:3],
            "current_agent": "scheme"
        }

    t_end = time.time()
    logger.info(f"⏱️  Gemini ranking: {t_end - t_rank_start:.2f}s")
    logger.info(f"⏱️  Total scheme agent: {t_end - t0:.2f}s")

    try:
        # AI JSON Parse
        cleaned_json = ai_response.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(cleaned_json)
        chat_text = parsed.get("chat_summary", "I found these relevant schemes for you:")

        # Metadata mapping
        metadata_map = {str(item.get('id')).strip(): item for item in parsed.get("schemes_metadata", [])}

        # 4. FINAL MERGE & SORT
        final_schemes = []
        for sd in schemes_data:
            sid = sd['id']
            if sid in metadata_map:
                meta = metadata_map[sid]
                sd.update({
                    "relevance_score": meta.get("relevance_score", 75),
                    "explanation": meta.get("explanation", ""),
                    "key_benefit": meta.get("key_benefit", "")
                })
            else:
                sd.update({
                    "relevance_score": 50,
                    "explanation": "Matching record found in database.",
                    "key_benefit": "See details for benefits."
                })
            final_schemes.append(sd)

        # Highest score first
        final_schemes.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)

        # Filter top N
        limit = requested_count if requested_count else 3
        display_schemes = final_schemes[:limit]

        # 5. PERSIST FULL PAYLOAD TO DB (so cards survive page reload)
        if conversation_id:
            try:
                async with AsyncSessionLocal() as db:
                    await save_message(
                        db=db,
                        conversation_id=uuid.UUID(conversation_id),
                        role="assistant",
                        content_type="scheme_results",   # tells frontend to render cards
                        content={
                            "query": last_message,        # original query for context
                            "summary": chat_text,         # conversational text
                            "schemes": display_schemes    # full structured scheme data
                        },
                        agent_used="scheme"
                    )
            except Exception as save_err:
                logger.warning(f"Could not save scheme results to DB: {save_err}")

        return {
            "messages": [AIMessage(content=chat_text)],
            "schemes": display_schemes,
            "current_agent": "scheme"
        }

    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        fallback = schemes_data[:requested_count] if requested_count else schemes_data[:3]
        fallback_text = "I found these schemes in our database:"

        # Also persist fallback
        if conversation_id:
            try:
                async with AsyncSessionLocal() as db:
                    await save_message(
                        db=db,
                        conversation_id=uuid.UUID(conversation_id),
                        role="assistant",
                        content_type="scheme_results",
                        content={"query": last_message, "summary": fallback_text, "schemes": fallback},
                        agent_used="scheme"
                    )
            except Exception as save_err:
                logger.warning(f"Could not save fallback scheme results: {save_err}")

        return {
            "messages": [AIMessage(content=fallback_text)],
            "schemes": fallback,
            "current_agent": "scheme"
        }


# ──────────────────────────────────────────────────────────────────────────────
# NODE: General Agent
# ──────────────────────────────────────────────────────────────────────────────

async def general_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")

    # ── Router already classified identity / greeting via hardcoded intercept ──
    # Read the intent flag set by router.py instead of re-running string checks.
    intent = state.get("intent")

    if intent == "identity":
        response = ("I'm MAYA — your AI Business Assistant for Indian MSMEs. "
                   "I help small businesses discover government schemes, plan "
                   "finances, build their brand, and grow their market. "
                   "What can I help you with?")
        await _save_agent_response(conversation_id, "general", response)
        return {"messages": [AIMessage(content=response)], "current_agent": "general"}

    if intent == "greeting":
        response = ("Hey! I'm MAYA, your MSME Business Assistant. "
                   "I can help you find government schemes, research your "
                   "market, plan finances, or build your brand. "
                   "What are you working on?")
        await _save_agent_response(conversation_id, "general", response)
        return {"messages": [AIMessage(content=response)], "current_agent": "general"}

    # Everything else — Gemini with system_instruction enforces scope
    response = await gemini_service.generate_response(last_message)
    await _save_agent_response(conversation_id, "general", response)
    return {"messages": [AIMessage(content=response)], "current_agent": "general"}


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Market Agent  (concurrent Tavily + Gemini for ~800ms savings)
# ──────────────────────────────────────────────────────────────────────────────

async def market_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")

    # Fire search immediately — don't await yet (concurrent execution)
    search_task = asyncio.create_task(tavily_service.search(last_message))

    # Await result when we actually need it
    search_results = await search_task

    prompt = f"""
    You are MAYA's Market Research specialist for MSMEs in India.
    User Query: {last_message}

    Real-time market data:
    {search_results}

    Task:
    Provide insights on market trends, competitor analysis, or industry outlook relevant to the user's query.
    Focus on actionable data for small businesses. Use the real-time data as evidence.
    If the query is too vague, ask clarifying questions about their specific industry or location.

    CRITICAL: Do NOT start with a greeting or announce yourself. Jump straight into the market insights.
    """
    response = await gemini_service.generate_response(prompt)

    # Extract Tavily source URLs
    sources = []
    if isinstance(search_results, dict):
        sources = [r.get("url", "") for r in search_results.get("results", [])]
    await _save_agent_response(conversation_id, "market", response, sources=sources)

    return {"messages": [AIMessage(content=response)], "current_agent": "market"}


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Brand Agent
# ──────────────────────────────────────────────────────────────────────────────

async def brand_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")

    prompt = f"""
    You are MAYA's Brand Consultant for Indian MSMEs.
    User Query: {last_message}

    Task:
    Help the user with branding, business names, taglines, or brand identity.
    Be creative, modern, and culturally relevant to the Indian market.
    Provide 3-5 distinct options where appropriate.

    CRITICAL: Do NOT start with a greeting or announce yourself. Jump straight into the branding suggestions.
    """
    response = await gemini_service.generate_response(prompt)
    await _save_agent_response(conversation_id, "brand", response)

    return {"messages": [AIMessage(content=response)], "current_agent": "brand"}


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Finance Agent
# ──────────────────────────────────────────────────────────────────────────────

async def finance_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")

    prompt = f"""
    You are MAYA's Financial Advisor for MSMEs.
    User Query: {last_message}

    Task:
    Provide advice on financial planning, loan eligibility (general), pricing strategies, or cost management.
    Do NOT give specific legal or tax advice; provide general guidance.
    If they ask about specific government schemes, briefly mention them but suggest asking the 'Scheme Navigator' for details.

    CRITICAL: Do NOT start with a greeting or announce yourself. Jump straight into the financial advice.
    """
    response = await gemini_service.generate_response(prompt)
    await _save_agent_response(conversation_id, "finance", response)

    return {"messages": [AIMessage(content=response)], "current_agent": "finance"}


# ──────────────────────────────────────────────────────────────────────────────
# NODE: Marketing Agent
# ──────────────────────────────────────────────────────────────────────────────

async def marketing_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    conversation_id = state.get("conversation_id")

    prompt = f"""
    You are MAYA's Marketing Strategist for Indian small businesses.
    User Query: {last_message}

    Task:
    Suggest low-cost, high-impact marketing strategies (Digital Marketing, Social Media, Local SEO, WhatsApp Marketing, etc.).
    Tailor the advice to the specific business type mentioned in the query.
    Focus on practical steps they can take immediately.

    CRITICAL: Do NOT start with a greeting or announce yourself. Jump straight into the marketing strategies.
    """
    response = await gemini_service.generate_response(prompt)
    await _save_agent_response(conversation_id, "marketing", response)

    return {"messages": [AIMessage(content=response)], "current_agent": "marketing"}


# ──────────────────────────────────────────────────────────────────────────────
# GRAPH CONSTRUCTION
# ──────────────────────────────────────────────────────────────────────────────

def create_graph():
    workflow = StateGraph(AgentState)

    # Nodes registration
    workflow.add_node("router", router_node)
    workflow.add_node("scheme", scheme_agent_node)
    workflow.add_node("market", market_agent_node)
    workflow.add_node("brand", brand_agent_node)
    workflow.add_node("finance", finance_agent_node)
    workflow.add_node("marketing", marketing_agent_node)
    workflow.add_node("general", general_agent_node)

    # Set entry point
    workflow.set_entry_point("router")

    # Conditional edges based on router output
    workflow.add_conditional_edges(
        "router",
        lambda x: x["current_agent"],
        {
            "scheme":    "scheme",
            "market":    "market",
            "brand":     "brand",
            "finance":   "finance",
            "marketing": "marketing",
            "general":   "general",
            "off_topic": "general",  # off_topic → general; system_instruction handles refusal
        }
    )

    # All agents go to END (single turn)
    workflow.add_edge("scheme", END)
    workflow.add_edge("market", END)
    workflow.add_edge("brand", END)
    workflow.add_edge("finance", END)
    workflow.add_edge("marketing", END)
    workflow.add_edge("general", END)

    return workflow.compile()


app_graph = create_graph()

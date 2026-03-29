import json
import re
from typing import Any, AsyncIterator, Dict, List

from agents.router import classify_intent
from database import AsyncSessionLocal
from services.mimo_service import mimo_service
from services.scheme_service import scheme_service
from services.tavily_service import tavily_service


def _safe_parse(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return value


def _chunk_text(text: str, chunk_size: int = 80) -> List[str]:
    if not text:
        return []
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]


async def _run_scheme_flow(query: str) -> Dict[str, Any]:
    match = re.search(r"\b\d+\b", query)
    requested_count = int(match.group()) if match else None

    async with AsyncSessionLocal() as db:
        schemes = await scheme_service.search_schemes(db, query, limit=5)

    if not schemes:
        return {
            "response": "I couldn't find a strong scheme match in the current database. Try sharing your business type, state, or the kind of support you need.",
            "agent": "scheme",
            "schemes": [],
        }

    normalized_schemes: List[Dict[str, Any]] = []
    for scheme in schemes:
        normalized_schemes.append(
            {
                "id": str(scheme.get("id")).strip(),
                "name": scheme.get("name"),
                "category": scheme.get("category") or "Business",
                "description": scheme.get("description"),
                "benefits": _safe_parse(scheme.get("benefits")) or [],
                "eligibility_criteria": _safe_parse(scheme.get("eligibility_criteria")),
                "required_documents": _safe_parse(scheme.get("required_documents")) or [],
                "application_mode": str(scheme.get("application_mode") or "Online/Offline"),
                "link": scheme.get("link"),
                "tags": _safe_parse(scheme.get("tags")) or [],
            }
        )

    analysis_input = [
        {"id": item["id"], "name": item["name"], "desc": item["description"]}
        for item in normalized_schemes
    ]
    prompt = f"""
    Analyze these government schemes for the query: "{query}"
    Data: {json.dumps(analysis_input)}

    Return ONLY a JSON object:
    {{
        "chat_summary": "Friendly 1-2 sentence overview",
        "schemes_metadata": [
            {{"id": "...", "relevance_score": 0-100, "explanation": "Why this fits?"}}
        ]
    }}
    """

    ai_response = await mimo_service.generate_text(prompt)
    try:
        parsed = json.loads(ai_response.replace("```json", "").replace("```", "").strip())
        metadata_map = {
            str(item.get("id")).strip(): item for item in parsed.get("schemes_metadata", [])
        }
        for scheme in normalized_schemes:
            metadata = metadata_map.get(scheme["id"], {})
            scheme["relevance_score"] = metadata.get("relevance_score", 50)
            scheme["explanation"] = metadata.get(
                "explanation",
                "Matching record found in the knowledge base.",
            )

        normalized_schemes.sort(key=lambda item: item.get("relevance_score", 0), reverse=True)
        return {
            "response": parsed.get(
                "chat_summary",
                "I found a few government schemes that look relevant for your request.",
            ),
            "agent": "scheme",
            "schemes": normalized_schemes[:requested_count] if requested_count else normalized_schemes,
        }
    except Exception as exc:
        print(f"Scheme analysis fallback triggered: {exc}")
        fallback = normalized_schemes[:requested_count] if requested_count else normalized_schemes
        return {
            "response": "I found these schemes in the knowledge base. I've listed the best matches below.",
            "agent": "scheme",
            "schemes": fallback,
        }


def _build_prompt(agent: str, query: str) -> str:
    if agent == "market":
        search_results = tavily_service.search(query)
        return f"""
        You are MAYA's market research specialist for Indian MSMEs.
        User query: "{query}"

        Reference data:
        {search_results}

        Give a direct, professional answer with concrete takeaways. Use the reference data when helpful, call out uncertainty when the search data is thin, and avoid generic greetings.
        """

    if agent == "brand":
        return f"""
        You are MAYA's brand strategist for early-stage and growth businesses.
        User query: "{query}"

        Provide a polished answer with a few distinctive options where useful. Keep the tone practical and modern, and avoid generic greetings.
        """

    if agent == "finance":
        return f"""
        You are MAYA's finance copilot for small businesses.
        User query: "{query}"

        Give structured, practical guidance on pricing, margins, budgeting, or planning. Be clear about assumptions and avoid greetings.
        """

    if agent == "marketing":
        return f"""
        You are MAYA's marketing strategist for MSMEs.
        User query: "{query}"

        Give action-oriented marketing advice with channels, experiments, and a realistic next-step plan. Avoid greetings.
        """

    return f"""
    The user asked: "{query}"

    Provide a direct, helpful answer for a business user in India. Keep it concise but useful, and avoid greetings or self-introductions unless the user explicitly asked for them.
    """


async def run_query(query: str) -> Dict[str, Any]:
    agent = classify_intent(query)

    if agent == "scheme":
        return await _run_scheme_flow(query)

    response = await mimo_service.generate_text(_build_prompt(agent, query))
    return {"response": response, "agent": agent, "schemes": []}


async def stream_query(query: str) -> AsyncIterator[Dict[str, Any]]:
    agent = classify_intent(query)
    yield {"type": "meta", "agent": agent}

    if agent == "scheme":
        result = await _run_scheme_flow(query)
        for chunk in _chunk_text(result["response"]):
            yield {"type": "delta", "content": chunk}
        yield {
            "type": "done",
            "response": result["response"],
            "agent": result["agent"],
            "schemes": result["schemes"],
        }
        return

    built_prompt = _build_prompt(agent, query)
    collected_chunks: List[str] = []
    async for chunk in mimo_service.generate_text_stream(built_prompt):
        collected_chunks.append(chunk)
        yield {"type": "delta", "content": chunk}

    final_response = "".join(collected_chunks).strip()
    yield {
        "type": "done",
        "response": final_response or "I couldn't generate a complete answer this time. Please try again.",
        "agent": agent,
        "schemes": [],
    }

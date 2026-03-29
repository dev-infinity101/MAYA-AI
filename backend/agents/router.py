from agents.state import AgentState
from typing import Iterable

INTENT_KEYWORDS = {
    "scheme": (
        "scheme",
        "subsidy",
        "grant",
        "mudra",
        "startup india",
        "stand up india",
        "pmegp",
        "msme",
        "government loan",
        "govt loan",
        "eligibility",
    ),
    "market": (
        "market research",
        "competitor",
        "competition",
        "industry trend",
        "industry",
        "demand",
        "customer segment",
        "market size",
    ),
    "brand": (
        "brand",
        "branding",
        "business name",
        "company name",
        "tagline",
        "slogan",
        "logo",
        "identity",
    ),
    "finance": (
        "price",
        "pricing",
        "profit",
        "margin",
        "break-even",
        "breakeven",
        "cost",
        "revenue",
        "cashflow",
        "budget",
        "financial",
    ),
    "marketing": (
        "marketing",
        "promote",
        "promotion",
        "advertising",
        "instagram",
        "facebook ads",
        "seo",
        "campaign",
        "lead generation",
        "social media",
    ),
}

GREETING_KEYWORDS = ("hello", "hi", "hey", "good morning", "good afternoon", "good evening")


def _contains_any(text: str, keywords: Iterable[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def _extract_text(content: object) -> str:
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        text_parts: list[str] = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                text_parts.append(str(item.get("text", "")))
        return " ".join(part for part in text_parts if part).strip()

    return str(content or "").strip()


def classify_intent(query: str) -> str:
    text = query.lower().strip()
    if not text:
        return "general"

    if _contains_any(text, GREETING_KEYWORDS):
        return "general"

    # Prefer the scheme path first because that is the one specialist flow with
    # real retrieval and ranking behind it.
    if _contains_any(text, INTENT_KEYWORDS["scheme"]):
        return "scheme"
    if _contains_any(text, INTENT_KEYWORDS["market"]):
        return "market"
    if _contains_any(text, INTENT_KEYWORDS["brand"]):
        return "brand"
    if _contains_any(text, INTENT_KEYWORDS["finance"]):
        return "finance"
    if _contains_any(text, INTENT_KEYWORDS["marketing"]):
        return "marketing"

    return "general"

async def route_request(state: AgentState) -> dict:
    messages = state["messages"]
    last_message = messages[-1]

    category = classify_intent(_extract_text(last_message.content))
    print(f"Routing to: {category}")
    return {"current_agent": category}

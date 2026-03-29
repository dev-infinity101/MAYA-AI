from services.gemini_service import gemini_service
from agents.state import AgentState

ROUTE_KEYWORDS = {
    "scheme": ["scheme", "loan", "subsidy", "yojana", "fund", "startup india", "mudra", "eligibility", "msme scheme", "women entrepreneur", "grant"],
    "market": ["market", "trend", "competitor", "industry", "demand", "supply", "research", "audience", "market size"],
    "brand": ["brand", "logo", "name", "tagline", "slogan", "identity", "trademarks", "design"],
    "finance": ["finance", "tax", "cost", "profit", "margin", "pricing", "budget", "gst", "revenue", "accounting"],
    "marketing": ["marketing", "advertise", "promotion", "seo", "social media", "campaign", "sales", "ads", "digital", "instagram", "facebook"],
}

async def route_request(state: AgentState) -> dict:
    messages = state["messages"]
    last_message = messages[-1]
    query = last_message.content.strip().lower()

    scores = {agent: 0 for agent in ROUTE_KEYWORDS}
    for agent, keywords in ROUTE_KEYWORDS.items():
        for kw in keywords:
            if kw in query:
                scores[agent] += 1
    
    best = max(scores, key=scores.get)
    if scores[best] > 0:
        found_category = best
    else:
        # Everything unrecognised goes to general
        # The system_instruction handles refusals from here
        found_category = "general"

    print(f"Routing to: {found_category}")
    return {"current_agent": found_category}

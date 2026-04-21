"""
Multi-Agent Business Report Pipeline.
Runs 5 specialized agents sequentially and aggregates into a single markdown report.
This module is called directly by the /api/chat/report endpoint — not through LangGraph.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import AsyncGenerator

from services.gemini_service import gemini_service
from services.scheme_service import scheme_service
from services.message_service import save_message
from database import AsyncSessionLocal

logger = logging.getLogger(__name__)

REPORT_PATTERNS = [
    r"(start|launch|begin|open|shuru|kholna).*(business|shop|store|dukan|karobar|vyapar)",
    r"(business|vyapar).*(plan|report|idea|analysis)",
    r"(complete|full|pura|detailed).*(analysis|plan|guide|report)",
    r"(naya|new).*(business|kaam|dhandha|startup)",
    r"(₹|rs\.?|rupee|budget|lakh|crore).*(business|start|launch|invest|kholna)",
    r"(mujhe|chahiye|batao).*(business|kholna|shuru|dhandha)",
    r"(how to start|how do i start|i want to start|i want to open)",
    r"(business launch|launch.*business|open.*shop|start.*store)",
]

import re


def detect_report_intent(query: str) -> bool:
    """Fast regex — no LLM call. Returns True if this looks like a full-report request."""
    q = query.lower().strip()
    for pattern in REPORT_PATTERNS:
        if re.search(pattern, q):
            return True
    return False


async def extract_business_context(query: str) -> dict:
    """Extract structured business info from the user query via a cheap Gemini call."""
    prompt = f"""Extract business context from this query. Return JSON only, no markdown, no explanation.

Query: "{query}"

Return exactly this JSON (use null for unknown):
{{
    "business_type": "string or null",
    "location": "string or null",
    "budget": "string or null",
    "sector": "string or null",
    "target_customers": "string or null"
}}"""

    try:
        raw = await gemini_service.generate_response(prompt)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Context extraction failed: {e}")
        return {
            "business_type": None, "location": None, "budget": None,
            "sector": None, "target_customers": None,
        }


async def _market_section(query: str, ctx: dict) -> str:
    prompt = f"""You are MAYA's Market Intelligence Agent writing a report section.

Business: {ctx.get('business_type') or 'Small business'}
Location: {ctx.get('location') or 'Uttar Pradesh'}
Budget: {ctx.get('budget') or 'Not specified'}

Write a market analysis (250-350 words) covering:
1. Market Size & Growth in the region
2. Key Competitors (local + online)
3. Target Customer Profile
4. Demand Trends & Opportunities
5. Key Risks

Use markdown with headers. Focus on {ctx.get('location') or 'UP'}, India. Be specific and actionable."""
    try:
        return await gemini_service.generate_response(prompt)
    except Exception as e:
        logger.error(f"Market section failed: {e}")
        return "_Market analysis unavailable._"


async def _finance_section(query: str, ctx: dict, market_ctx: str) -> str:
    prompt = f"""You are MAYA's Financial Planning Agent writing a report section.

Business: {ctx.get('business_type') or 'Small business'}
Location: {ctx.get('location') or 'Uttar Pradesh'}
Budget: {ctx.get('budget') or 'Not specified'}
Market Context (brief): {market_ctx[:400]}

Write a financial plan (250-350 words) covering:
1. Startup Cost Breakdown (equipment, rent, inventory, licenses)
2. Monthly Operating Expenses estimate
3. Pricing Strategy
4. Revenue Projections (Month 1, 3, 6, 12)
5. Break-Even Analysis
6. GST & Compliance basics

Present numbers in ₹. Use tables where helpful. Format as markdown."""
    try:
        return await gemini_service.generate_response(prompt)
    except Exception as e:
        logger.error(f"Finance section failed: {e}")
        return "_Financial plan unavailable._"


async def _scheme_section(query: str) -> str:
    try:
        async with AsyncSessionLocal() as db:
            schemes = await scheme_service.search_schemes(db, query, limit=4)

        if not schemes:
            return "_No matching schemes found in MAYA's database._"

        lines = ["| Scheme | Category | Key Benefit |",
                 "|--------|----------|-------------|"]
        for s in schemes:
            benefit = ""
            if s.benefits:
                b = s.benefits
                if isinstance(b, str):
                    try:
                        b = json.loads(b)
                    except Exception:
                        pass
                benefit = b[0] if isinstance(b, list) and b else str(b)[:80]
            lines.append(f"| **{s.name}** | {s.category or 'MSME'} | {benefit} |")

        links = []
        for s in schemes:
            if s.link:
                links.append(f"- [{s.name}]({s.link})")

        result = "\n".join(lines)
        if links:
            result += "\n\n**Apply Here:**\n" + "\n".join(links)
        return result
    except Exception as e:
        logger.error(f"Scheme section failed: {e}")
        return "_Scheme lookup unavailable._"


async def _brand_section(query: str, ctx: dict) -> str:
    prompt = f"""You are MAYA's Brand Strategy Agent writing a report section.

Business: {ctx.get('business_type') or 'Small business'}
Location: {ctx.get('location') or 'Uttar Pradesh'}
Target Customers: {ctx.get('target_customers') or 'Local consumers'}

Write a brand strategy (200-280 words) covering:
1. 5 Business Name Suggestions (with meaning/rationale)
2. Tagline Options (2-3)
3. Brand Positioning Statement
4. Visual Identity Direction (colors, style)

Make names culturally fitting for {ctx.get('location') or 'UP'}. Include Hindi names where relevant. Format as markdown."""
    try:
        return await gemini_service.generate_response(prompt)
    except Exception as e:
        logger.error(f"Brand section failed: {e}")
        return "_Brand suggestions unavailable._"


async def _marketing_section(query: str, ctx: dict, market_ctx: str) -> str:
    prompt = f"""You are MAYA's Marketing Strategy Agent writing a report section.

Business: {ctx.get('business_type') or 'Small business'}
Location: {ctx.get('location') or 'Uttar Pradesh'}
Budget: {ctx.get('budget') or '₹5,000-10,000/month'}
Market Context (brief): {market_ctx[:300]}

Write a marketing plan (250-350 words) covering:
1. Digital Marketing (Google Business, Social Media channels)
2. Local/Offline Marketing Tactics
3. WhatsApp Business Strategy
4. Customer Acquisition Plan (first 100 customers)
5. Monthly Budget Breakdown
6. 30-60-90 Day Action Plan

Focus on LOW-COST tactics. Format as markdown."""
    try:
        return await gemini_service.generate_response(prompt)
    except Exception as e:
        logger.error(f"Marketing section failed: {e}")
        return "_Marketing plan unavailable._"


def _build_report(ctx: dict, market: str, finance: str, schemes: str, brand: str, marketing: str) -> str:
    biz = ctx.get("business_type") or "Your Business"
    loc = ctx.get("location") or "India"
    budget = ctx.get("budget") or "Not specified"
    now = datetime.now().strftime("%d %B %Y")

    return f"""# Business Launch Report

> **Business:** {biz} in {loc}
> **Budget:** {budget}
> **Generated:** {now} by MAYA — AI Business Assistant

---

## 1. Market Analysis

{market}

---

## 2. Financial Plan

{finance}

---

## 3. Government Schemes You Can Access

{schemes}

---

## 4. Brand Identity

{brand}

---

## 5. Marketing Strategy

{marketing}

---

## Next Steps

1. **Register on Udyam Portal** — Free MSME registration (udyamregistration.gov.in)
2. **Apply for Schemes** — Use MAYA to generate application drafts
3. **Set up Google Business Profile** — Free, takes 10 minutes
4. **Open a Business Bank Account** — Required for all scheme applications
5. **Get Required Licenses** — Trade license, FSSAI, GST as applicable

---

*Generated by MAYA's Multi-Agent AI system. 5 specialized agents analysed your business.*
"""


async def run_report_pipeline(
    query: str,
    conversation_id: str | None,
    clerk_user_id: str | None,
) -> AsyncGenerator[str, None]:
    """
    SSE generator: streams progress events then a final report event.
    Events: {type: progress, stage, message} | {type: report, content} | {type: done}
    """

    def _event(data: dict) -> str:
        return f"data: {json.dumps(data)}\n\n"

    yield _event({"type": "progress", "stage": "analyzing", "message": "Understanding your business..."})

    ctx = await extract_business_context(query)

    yield _event({"type": "progress", "stage": "market", "message": "Researching market..."})
    market = await _market_section(query, ctx)

    yield _event({"type": "progress", "stage": "finance", "message": "Crunching the numbers..."})
    finance = await _finance_section(query, ctx, market)

    yield _event({"type": "progress", "stage": "schemes", "message": "Finding government schemes..."})
    schemes = await _scheme_section(query)

    yield _event({"type": "progress", "stage": "brand", "message": "Crafting brand identity..."})
    brand = await _brand_section(query, ctx)

    yield _event({"type": "progress", "stage": "marketing", "message": "Building marketing strategy..."})
    marketing = await _marketing_section(query, ctx, market)

    yield _event({"type": "progress", "stage": "aggregating", "message": "Compiling your report..."})
    report_md = _build_report(ctx, market, finance, schemes, brand, marketing)

    # Save to DB
    if conversation_id:
        try:
            async with AsyncSessionLocal() as db:
                await save_message(
                    db=db,
                    conversation_id=uuid.UUID(conversation_id),
                    role="assistant",
                    content_type="business_report",
                    content={
                        "report": report_md,
                        "business_context": ctx,
                        "agents_used": ["market", "finance", "scheme", "brand", "marketing"],
                    },
                    agent_used="report_pipeline",
                )
        except Exception as e:
            logger.warning(f"Could not save report to DB: {e}")

    yield _event({"type": "report", "content": report_md, "business_context": ctx})
    yield _event({"type": "done"})

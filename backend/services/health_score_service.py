"""
services/health_score_service.py
Pure rule-based Business Health Score calculator.
No LLM calls — instant, deterministic, reproducible.
"""
from typing import Optional
from models import UserProfile


def calculate_health_score(profile: Optional[UserProfile], interactions_count: int = 0) -> dict:
    """
    Calculates a 0-100 health score across 5 dimensions.
    Returns full breakdown with grade, recommendations, and eligible_scheme_count.
    """
    scores: dict[str, int] = {}
    recommendations: dict[str, str] = {}

    # ── 1. Scheme Utilization (0–20 pts) ─────────────────────────────────────
    # Measures how actively the user is using scheme features
    scheme_score = min(interactions_count * 5, 20)
    scores["scheme_utilization"] = scheme_score
    if scheme_score < 10:
        recommendations["scheme_utilization"] = (
            "You haven't applied to any schemes yet. "
            "PMEGP could give you up to ₹25L — ask MAYA about it."
        )

    # ── 2. Registration Compliance (0–20 pts) ────────────────────────────────
    reg_score = 0
    if profile and profile.udyam_registered:
        reg_score += 12
    if profile and profile.turnover_range and profile.turnover_range != "Not started":
        reg_score += 8
    scores["registration"] = reg_score
    if not (profile and profile.udyam_registered):
        recommendations["registration"] = (
            "Register on Udyam portal — it's free and unlocks "
            "10+ additional government schemes."
        )

    # ── 3. Financial Health (0–20 pts) ───────────────────────────────────────
    turnover_points = {
        "Not started": 0,
        "Under ₹10 Lakh": 8,
        "₹10L - ₹50L": 14,
        "₹50L - ₹5Cr": 18,
        "Above ₹5Cr": 20,
    }
    fin_score = turnover_points.get(
        (profile.turnover_range or "Not started") if profile else "Not started", 0
    )
    loan_penalty = -5 if (profile and profile.existing_loan) else 0
    fin_total = max(0, fin_score + loan_penalty)
    scores["financial"] = fin_total
    if fin_total < 10:
        recommendations["financial"] = (
            "Aim to cross ₹10L turnover to unlock higher subsidy tiers. "
            "Consider PMEGP or Stand-Up India for capital."
        )

    # ── 4. Market Presence (0–20 pts) ────────────────────────────────────────
    sector_points: dict[str, int] = {
        "Technology": 18,
        "Healthcare": 16,
        "Food & Beverage": 15,
        "Textile & Garments": 15,
        "Handicrafts": 14,
        "Education": 13,
        "Beauty & Wellness": 13,
        "Retail": 12,
        "Transport": 11,
        "Agriculture": 11,
        "Construction": 10,
        "Other": 10,
    }
    sector = (profile.sector or "Other") if profile else "Other"
    market_score = sector_points.get(sector, 10)
    scores["market_presence"] = market_score

    # ── 5. Growth Readiness (0–20 pts) ───────────────────────────────────────
    goal_points: dict[str, int] = {
        "All of the above": 20,
        "Market Access": 16,
        "Funding / Loan": 15,
        "Equipment / Machinery": 14,
        "Brand Building": 13,
        "Training / Skills": 12,
    }
    goal = (profile.primary_goal or "") if profile else ""
    growth_score = goal_points.get(goal, 10)
    scores["growth_readiness"] = growth_score
    if growth_score < 13:
        recommendations["growth_readiness"] = (
            "Define your primary goal more specifically to unlock targeted schemes. "
            "Go to Settings → Profile to update it."
        )

    total = sum(scores.values())

    return {
        "total_score": total,
        "max_score": 100,
        "grade": _get_grade(total),
        "dimensions": scores,
        "recommendations": recommendations,
        "eligible_scheme_count": _count_eligible_schemes(profile),
    }


def _get_grade(score: int) -> dict:
    if score >= 80:
        return {"label": "Excellent",       "color": "emerald"}
    if score >= 60:
        return {"label": "Good",            "color": "blue"}
    if score >= 40:
        return {"label": "Developing",      "color": "yellow"}
    return     {"label": "Getting Started", "color": "orange"}


def _count_eligible_schemes(profile: Optional[UserProfile]) -> int:
    """
    Heuristic count of likely-eligible schemes based on profile.
    Keeps things deterministic — no DB queries needed here.
    """
    if not profile:
        return 3   # base minimum: Mudra, general MSME, PM Vikas

    count = 3  # always available

    # Category boosters
    if profile.category in ("Women", "SC", "ST"):
        count += 3   # Stand-Up India, Mahila Udyam, PMEGP women quota
    if profile.category == "OBC":
        count += 1

    # Udyam unlocks many
    if profile.udyam_registered:
        count += 4

    # Sector-specific
    if profile.sector in ("Technology", "Food & Beverage", "Textile & Garments"):
        count += 2
    if profile.sector == "Handicrafts":
        count += 2   # Vishwakarma

    # Revenue tier
    turnover_boosts = {
        "Under ₹10 Lakh": 1,
        "₹10L - ₹50L": 2,
        "₹50L - ₹5Cr": 3,
        "Above ₹5Cr": 2,   # fewer startup schemes, more expansion
    }
    count += turnover_boosts.get(profile.turnover_range or "", 0)

    return min(count, 18)   # cap at 18 — reasonable max

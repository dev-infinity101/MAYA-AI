"""
Scheme GPS Trajectory Engine — pure rule engine, zero LLM calls.
Reads user profile fields and returns a ranked growth roadmap.
"""

from typing import List, Dict

# Sorted by priority level: now → quick_win → 6_months → 12_months
UPGRADE_PATHS = [
    {
        "condition": lambda p: p.get("category") in ["SC", "ST", "Women"],
        "level": "now",
        "title": "Priority Schemes Available",
        "description": "Special schemes for SC/ST/Women entrepreneurs with higher subsidies and reserved quotas.",
        "action": "MAYA has matched these for you — check the scheme cards above",
        "action_type": "free",
        "estimated_schemes": 3,
        "estimated_value": "₹1–25 lakh",
    },
    {
        "condition": lambda p: not p.get("udyam_registered"),
        "level": "quick_win",
        "title": "Register on Udyam Portal",
        "description": "Free MSME registration — takes 10 minutes with Aadhaar. Unlocks majority of government schemes.",
        "action": "Visit udyamregistration.gov.in",
        "action_type": "free",
        "estimated_schemes": 5,
        "estimated_value": "₹5–10 lakh",
    },
    {
        "condition": lambda p: (
            p.get("turnover_range") in ["0-5L", "5-10L"]
            and not p.get("existing_loan")
        ),
        "level": "quick_win",
        "title": "Apply for Mudra Shishu Loan",
        "description": "Collateral-free loan up to ₹50,000 at low interest — easiest entry-level business loan.",
        "action": "Apply through any bank — MAYA can generate your application draft",
        "action_type": "registration",
        "estimated_schemes": 2,
        "estimated_value": "₹50,000",
    },
    {
        "condition": lambda p: (
            p.get("sector") in ["manufacturing", "food_processing"]
            and p.get("udyam_registered")
        ),
        "level": "quick_win",
        "title": "Get GST Registration",
        "description": "Opens doors to export schemes and CLCSS capital subsidies for your sector.",
        "action": "Apply at gst.gov.in — mandatory for turnover above ₹40L",
        "action_type": "registration",
        "estimated_schemes": 3,
        "estimated_value": "₹2–15 lakh",
    },
    {
        "condition": lambda p: p.get("turnover_range") in ["0-5L", "5-10L", "10-25L"],
        "level": "6_months",
        "title": "Scale to ₹25L+ Turnover",
        "description": "At ₹25L turnover, you qualify for Mudra Kishore (up to ₹5L) and more credit-linked schemes.",
        "action": "Use MAYA's marketing agent to build your first 100 customers",
        "action_type": "growth",
        "estimated_schemes": 4,
        "estimated_value": "₹5–10 lakh",
    },
    {
        "condition": lambda p: (
            p.get("turnover_range") in ["25-50L", "50L+"]
            and p.get("category") in ["SC", "ST", "Women"]
        ),
        "level": "12_months",
        "title": "Apply for Stand-Up India Loan",
        "description": "₹10L to ₹1Cr for SC/ST/Women in manufacturing or services — flagship scheme.",
        "action": "Use MAYA's draft generator for the Stand-Up India application",
        "action_type": "growth",
        "estimated_schemes": 1,
        "estimated_value": "₹10L – ₹1 Cr",
    },
]

LEVEL_ORDER = {"now": 0, "quick_win": 1, "6_months": 2, "12_months": 3}


def generate_trajectory(user_profile: dict) -> List[Dict]:
    """
    Evaluate upgrade paths against user profile and return a ranked roadmap.
    Returns at most 5 steps, sorted now → quick_win → 6_months → 12_months.
    """
    trajectory = []

    for path in UPGRADE_PATHS:
        try:
            if path["condition"](user_profile):
                trajectory.append({
                    "level": path["level"],
                    "title": path["title"],
                    "description": path["description"],
                    "action": path["action"],
                    "action_type": path["action_type"],
                    "estimated_schemes": path["estimated_schemes"],
                    "estimated_value": path["estimated_value"],
                })
        except Exception:
            continue  # never crash on a bad profile dict

    trajectory.sort(key=lambda x: LEVEL_ORDER.get(x["level"], 99))
    return trajectory[:5]

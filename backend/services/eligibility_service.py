"""
services/eligibility_service.py
────────────────────────────────
Rule-based eligibility checker.
Pure Python — no LLM, no DB calls, no async.
Receives pre-fetched ORM objects; returns a structured result dict.

Key design:
  - Social category mismatch  → hard fail (not eligible)
  - Specific sector mismatch  → hard fail
  - Specific geography mismatch → hard fail
  - MSME / greenfield issues  → advisory only (soft, no hard fail)
  - is_eligible = no hard fails (score is for display only)
"""

from __future__ import annotations
from typing import Optional, Any
import re

# ──────────────────────────────────────────────────────────────────────────────
# Social category synonyms
# ──────────────────────────────────────────────────────────────────────────────

_CATEGORY_SYNONYMS: dict[str, list[str]] = {
    "sc":               ["sc", "scheduled caste", "dalit"],
    "st":               ["st", "scheduled tribe", "tribal", "adivasi"],
    "obc":              ["obc", "other backward class", "backward class", "obc-creamy", "obc-non creamy"],
    "backward class":   ["backward class", "bc", "obc", "other backward", "backward"],
    "women":            ["women", "woman", "mahila", "female", "shg", "self help group"],
    "minority":         ["minority", "muslim", "christian", "sikh", "buddhist", "jain", "parsi"],
    "ews":              ["ews", "economically weaker", "general-ews"],
    "general":          ["general", "open", "unreserved"],
    "ex-serviceman":    ["ex-serviceman", "ex serviceman", "veteran", "defence personnel", "ex-defence"],
    "safai karamchari": [
        "safai karamchari", "manual scavenger", "scavenger", "sanitation worker",
        "liberated scavenger", "nskfdc",
    ],
    "vulnerable groups": [
        "vulnerable", "pwd", "person with disability", "disabled", "transgender",
        "orphan", "specially abled",
    ],
}

# ──────────────────────────────────────────────────────────────────────────────
# Sector synonyms — canonical → keywords that appear in scheme sector strings
# ──────────────────────────────────────────────────────────────────────────────

_SECTOR_SYNONYMS: dict[str, list[str]] = {
    "manufacturing": [
        "manufacturing", "factory", "production", "industrial", "industry",
        "msme", "automobile", "automotive", "vehicle", "component",
        "white goods", "electronics", "pli", "make in india",
    ],
    "services": [
        "services", "service", "consulting", "hospitality", "hotel",
        "maintenance", "facility",
    ],
    "trading": [
        "trading", "trade", "retail", "wholesale", "vending", "vendor",
        "merchant", "ecommerce", "e-commerce", "digital trade", "marketplace",
    ],
    "agriculture": [
        "agriculture", "agri", "farming", "farm", "horticulture", "fisheries",
        "aquaculture", "animal husbandry", "livestock", "poultry", "dairy",
        "rubber", "spice", "plantation", "nursery", "cardamom", "fishing",
        "fisherman", "agribusiness", "agro", "crop", "fishery",
    ],
    "textiles": [
        "textile", "handloom", "weaving", "garment", "coir", "apparel",
        "khadi", "silk", "cloth", "loom", "yarn", "fibre", "fiber", "jute",
    ],
    "technology": [
        "technology", "tech", "software", "information technology",
        "biotech", "biotechnology", "innovation", "startup", "telecom",
        "semiconductor", "chip", "hardware", "defence", "defense", "aerospace",
        "research", "deeptech", "artificial intelligence",
        "machine learning", "deep tech",
    ],
    "healthcare": [
        "health", "medical", "pharma", "pharmaceutical", "medicine",
        "hospital", "diagnostic", "wellness", "ayurveda", "clinic",
        "pharmacy", "drug", "biomedical", "healthcare",
    ],
    "food": [
        "food", "restaurant", "catering", "beverage", "dairy",
        "packaged food", "bakery", "snack", "confectionery", "food processing",
    ],
    "handicrafts": [
        "handicraft", "artisan", "craft", "traditional", "vishwakarma",
        "pottery", "embroidery", "jewellery", "jewelry", "sculpture",
        "traditional industry",
    ],
    "education": [
        "education", "school", "training", "skill", "coaching", "edtech",
        "vocational", "e-learning", "upskilling", "skill development", "skilling",
    ],
    "construction": [
        "construction", "building", "infrastructure", "real estate", "civil",
        "architecture", "contractor",
    ],
    "transport": [
        "transport", "logistics", "cargo", "fleet", "courier", "shipping",
    ],
    "tourism": [
        "tourism", "travel", "tour operator", "travel agent", "eco-tourism",
        "heritage", "hospitality", "hotel",
    ],
    "export": [
        "export", "international trade", "overseas", "foreign trade", "iec",
        "exporter", "import",
    ],
    "finance": [
        "finance", "banking", "insurance", "nbfc", "fintech", "microfinance",
        "micro-finance", "credit", "lending", "investment",
    ],
    "sanitation": [
        "sanitation", "waste", "garbage", "hygiene", "cleanliness", "swachhta",
        "waste management",
    ],
    "defence": [
        "defence", "defense", "aerospace", "military", "drdo",
        "armed forces", "idex", "tdf",
    ],
    "energy": [
        "energy", "solar", "renewable", "green energy", "clean energy",
        "power", "photovoltaic", "wind",
    ],
    "innovation": [
        "innovation", "r&d", "prototype", "incubation", "proof of concept",
        "poc", "technology development",
    ],
    "rubber": ["rubber", "latex"],
    "fisheries": [
        "fisheries", "fishery", "aquaculture", "fishing", "fish", "seafood",
        "coastal fisheries", "aqua",
    ],
}

# Terms that make a sector requirement "open to all" / broad
_BROAD_SECTOR_TERMS = {
    "all", "multi", "any", "n/a", "high growth", "small scale",
    "micro-business", "micro business", "rehabilitation", "all type",
    "all kind", "all sector", "multi-sector", "multi sector",
    "multi-skill", "all industry", "any industry", "general",
    # Scheme-type labels (describe the financial instrument, not user industry)
    "micro-finance", "micro finance", "microfinance",
    "micro-credit", "micro credit", "microcredit",
}

# ──────────────────────────────────────────────────────────────────────────────
# Geography region sets
# ──────────────────────────────────────────────────────────────────────────────

_NORTHEAST_STATES = {
    "assam", "meghalaya", "manipur", "mizoram", "nagaland",
    "tripura", "arunachal pradesh", "sikkim",
}

_COASTAL_STATES = {
    "gujarat", "maharashtra", "goa", "karnataka", "kerala",
    "tamil nadu", "andhra pradesh", "telangana", "odisha",
    "west bengal", "puducherry",
}

_COIR_STATES = {"kerala", "tamil nadu", "karnataka", "andhra pradesh", "goa"}

_RUBBER_SPICE_STATES = {"kerala", "tamil nadu", "karnataka", "assam"} | _NORTHEAST_STATES

_JK_TERMS = {"kashmir", "jammu", "j&k", "ladakh", "pok", "chhamb"}


# ──────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────────────────────────────────────

def _accepts_all(scheme_cats: list[str]) -> bool:
    return any(c.strip().lower() in ("all", "any", "n/a") for c in scheme_cats)


def _category_matches(user_cat: Optional[str], scheme_cats: list[str]) -> bool:
    """True if user's social category satisfies at least one scheme category."""
    if not scheme_cats or _accepts_all(scheme_cats):
        return True
    user_lower = (user_cat or "general").lower()
    for scheme_cat in scheme_cats:
        sc_lower = scheme_cat.strip().lower()
        if sc_lower in user_lower or user_lower in sc_lower:
            return True
        for synonyms in _CATEGORY_SYNONYMS.values():
            if sc_lower in synonyms and any(s in user_lower for s in synonyms):
                return True
    return False


def _is_broad_sector(scheme_sector: Optional[str]) -> bool:
    if not scheme_sector:
        return True
    sc = scheme_sector.lower()
    return any(term in sc for term in _BROAD_SECTOR_TERMS)


def _normalize_sector(text: str) -> set[str]:
    """Map a free-form sector/business_type string to canonical sector labels."""
    if not text:
        return set()
    t = text.lower().strip()
    if t in ("other", "n/a", "not started yet", ""):
        return set()
    # Tokenize for whole-word matching of short synonyms
    words = set(re.split(r"[\s/,&\-]+", t))
    matched: set[str] = set()
    for canonical, synonyms in _SECTOR_SYNONYMS.items():
        for s in synonyms:
            if len(s) <= 3:
                # Short tokens must be whole words to avoid false substring matches
                if s in words:
                    matched.add(canonical)
                    break
            else:
                if s in t:
                    matched.add(canonical)
                    break
    return matched


def _sector_matches(user_sector: Optional[str], user_biz_type: Optional[str],
                    scheme_sector: Optional[str]) -> bool:
    """True if user's sector/business_type canonicals intersect with scheme's."""
    if _is_broad_sector(scheme_sector):
        return True
    if not scheme_sector:
        return True
    # Combine signals from both profile fields
    user_canonicals = _normalize_sector(user_sector or "") | _normalize_sector(user_biz_type or "")
    if not user_canonicals:
        return False  # user hasn't specified sector — can't confirm
    scheme_canonicals = _normalize_sector(scheme_sector)
    if not scheme_canonicals:
        # Scheme has an unrecognised sector string — be lenient
        return True
    return bool(user_canonicals & scheme_canonicals)


def _geography_matches(user_state: Optional[str],
                        scheme_geo: Optional[str]) -> tuple[bool, str]:
    """
    Returns (passes, reason_string).
    Reason is used in both `reasons` (if pass) and `missing_criteria` (if fail).
    """
    if not scheme_geo:
        return True, ""

    geo = scheme_geo.lower().strip()

    # Nationwide
    if any(t in geo for t in ("india-wide", "india wide", "pan india", "all india",
                               "all states", "all over india")):
        return True, "Scheme is open across India"

    # Rural / statutory towns — cannot verify from profile, be lenient
    if "rural" in geo and not any(t in geo for t in ("coir", "fisheries", "coastal")):
        return True, "Rural area requirement — verify eligibility locally"
    if "statutory town" in geo or "urban" in geo or "peri-urban" in geo:
        return True, "Location requirement — verify eligibility locally"

    if not user_state:
        return False, (
            f"Scheme has geographic restrictions ({scheme_geo}) — "
            "please add your state in Settings to check eligibility"
        )

    state_lower = user_state.lower().strip()

    # Direct state name check
    if state_lower in geo or any(tok in geo for tok in state_lower.split() if len(tok) > 2):
        return True, f"Your state ({user_state}) is covered by this scheme"

    # Northeast region
    if any(t in geo for t in ("northeast", "ner", "north east", "north-east", "northeastern")):
        if state_lower in _NORTHEAST_STATES:
            return True, f"Your state ({user_state}) is in the Northeast region"
        return False, f"Scheme operates only in Northeast India — your state ({user_state}) is not covered"

    # Coastal / fisheries areas
    if any(t in geo for t in ("coastal", "fisheries area", "fishing area")):
        if state_lower in _COASTAL_STATES:
            return True, f"Your state ({user_state}) is a coastal/fisheries state"
        return False, f"Scheme is for coastal/fisheries regions — your state ({user_state}) is not covered"

    # Coir production areas
    if "coir" in geo:
        if state_lower in _COIR_STATES:
            return True, f"Your state ({user_state}) is a coir production area"
        return False, f"Scheme is for coir production regions — your state ({user_state}) is not covered"

    # Rubber / spice / plantation regions
    if any(t in geo for t in ("rubber", "spice", "plantation", "cardamom")):
        if state_lower in _RUBBER_SPICE_STATES:
            return True, f"Your state ({user_state}) is in the plantation/spice cultivation region"
        return False, f"Scheme is for spice/rubber regions — your state ({user_state}) is not covered"

    # J&K / PoK specific
    if any(t in geo for t in _JK_TERMS):
        if any(t in state_lower for t in _JK_TERMS):
            return True, f"Your state ({user_state}) is covered"
        return False, f"Scheme is specific to Jammu & Kashmir — your state ({user_state}) is not covered"

    # Spice Regions, cluster areas, or other unrecognised regional labels — lenient
    return True, f"Geographic scope: {scheme_geo} — verify local eligibility"


def _pick_max_benefit(benefits: list[str], user_cat: Optional[str]) -> str:
    if not benefits:
        return "As per scheme guidelines"
    cat_lower = (user_cat or "").lower()
    priority_kws = ["higher", "additional", "special", "subsidy", "crore", "lakh"]
    if any(k in cat_lower for k in ["sc", "st", "women", "obc", "minority", "ews"]):
        for b in benefits:
            if any(kw in b.lower() for kw in priority_kws):
                return b
    return benefits[0]


# ──────────────────────────────────────────────────────────────────────────────
# Public function
# ──────────────────────────────────────────────────────────────────────────────

def check_eligibility(profile: Any, scheme: Any) -> dict:
    """
    Rule-based eligibility evaluation.

    Args:
        profile: UserProfile ORM object (may be None for guests)
        scheme:  Scheme ORM object

    Returns dict matching EligibilityResponse schema:
        {is_eligible, match_score, max_benefit, reasons, missing_criteria}
    """
    criteria: dict = scheme.eligibility_criteria or {}
    if not isinstance(criteria, dict):
        criteria = {}

    def _get(attr: str, default=None):
        return getattr(profile, attr, default) if profile else default

    user_category   = _get("category")
    user_sector     = _get("sector")
    user_biz_type   = _get("business_type")
    user_state      = _get("state")
    user_udyam      = _get("udyam_registered", False)
    user_loan       = _get("existing_loan", False)

    reasons: list[str] = []
    missing: list[str] = []
    score_points = 0
    max_points   = 0
    hard_fail    = False

    # ── Rule 1: Social Category  (weight 35, HARD FAIL) ──────────────────────
    scheme_cats: list[str] = criteria.get("social_category", ["All"])
    if not isinstance(scheme_cats, list):
        scheme_cats = [str(scheme_cats)]
    max_points += 35

    if _accepts_all(scheme_cats):
        score_points += 35
        reasons.append("Open to all social categories — no restriction")
    elif _category_matches(user_category, scheme_cats):
        score_points += 35
        cat_str = ", ".join(scheme_cats)
        reasons.append(
            f"Your category ({user_category or 'General'}) qualifies"
            f" — scheme targets {cat_str}"
        )
    else:
        hard_fail = True
        cat_str = ", ".join(scheme_cats)
        missing.append(
            f"Scheme is exclusively for {cat_str}"
            f" — your category ({user_category or 'General'}) does not qualify"
        )

    # ── Rule 2: Sector  (weight 30, HARD FAIL for specific sectors) ──────────
    scheme_sector: str = criteria.get("sector", "All")
    max_points += 30

    if _is_broad_sector(scheme_sector):
        score_points += 30
        reasons.append("Scheme is open across multiple sectors")
    elif _sector_matches(user_sector, user_biz_type, scheme_sector):
        score_points += 30
        display_sector = user_sector or user_biz_type or "your sector"
        reasons.append(
            f"Your sector ({display_sector}) aligns with scheme scope ({scheme_sector})"
        )
    else:
        hard_fail = True
        display_sector = user_sector or user_biz_type or "not specified"
        missing.append(
            f"Scheme targets '{scheme_sector}'"
            f" — your sector ({display_sector}) does not qualify"
        )

    # ── Rule 3: Geography  (weight 15, HARD FAIL for region-specific schemes) ─
    scheme_geo: str = criteria.get("geography", "India-wide")
    max_points += 15

    geo_ok, geo_msg = _geography_matches(user_state, scheme_geo)
    if geo_ok:
        score_points += 15
        if geo_msg and "open across India" not in geo_msg and "verify" not in geo_msg:
            reasons.append(geo_msg)
    else:
        hard_fail = True
        missing.append(geo_msg)

    # ── Rule 4: MSME / Udyam Registration  (weight 10, SOFT) ─────────────────
    tags_text  = " ".join(str(t) for t in (scheme.tags or [])).lower()
    cat_text   = (scheme.category or "").lower()
    desc_text  = (scheme.description or "").lower()
    ownership  = (criteria.get("ownership_stake", "") or "").lower()

    scheme_needs_msme = (
        "msme" in tags_text or "msme" in cat_text or
        "udyam" in desc_text or "msme" in desc_text or
        "udyam" in ownership or "registered msme" in ownership
    )
    max_points += 10

    if scheme_needs_msme:
        if user_udyam:
            score_points += 10
            reasons.append("Udyam/MSME registered — meets scheme requirement")
        else:
            score_points += 4  # partial: registration is free and fast
            missing.append(
                "Udyam registration preferred — register free at udyamregistration.gov.in"
                " to strengthen your application"
            )
    else:
        score_points += 10

    # ── Rule 5: Greenfield / First-time borrower  (weight 10, SOFT) ──────────
    is_greenfield = any(
        kw in desc_text
        for kw in ("greenfield", "first-time", "first time", "new enterprise", "new unit")
    )
    max_points += 10

    if is_greenfield and user_loan:
        score_points += 4
        missing.append(
            "Scheme prefers first-time / greenfield borrowers"
            " — existing loan may reduce eligibility; consult the bank directly"
        )
    else:
        score_points += 10
        if is_greenfield and not user_loan:
            reasons.append("No existing loan — meets fresh-credit requirement")

    # ── Final aggregation ─────────────────────────────────────────────────────
    match_score = round((score_points / max_points) * 100) if max_points else 0
    is_eligible = not hard_fail

    benefits_list = scheme.benefits if isinstance(scheme.benefits, list) else []
    max_benefit   = _pick_max_benefit(benefits_list, user_category)

    if is_eligible and not reasons:
        reasons.append("Your profile broadly matches this scheme's requirements")

    return {
        "is_eligible":      is_eligible,
        "match_score":      match_score,
        "max_benefit":      max_benefit,
        "reasons":          reasons[:4],
        "missing_criteria": missing[:4],
    }

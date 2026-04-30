"""
routers/draft.py — Application Draft Generator

Two generation modes:
  1. /api/draft/generate      — LEGACY: simple template fill (kept for backward compat)
  2. /api/draft/generate-rich — NEW: Gemini-powered scheme-specific structured reports
"""
import json
import logging
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from database import get_db
from middleware.auth import get_current_user_id
from services.gemini_service import gemini_service
from services.eligibility_service import check_eligibility as rule_check_eligibility
from data.scheme_templates import SCHEME_TEMPLATES, resolve_scheme_template
from agents.draft_templates import DRAFT_PROMPT_TEMPLATES, SCHEME_KEY_MAP, get_pmegp_subsidy_rate
from models import UserSchemeInteraction, Scheme, UserProfile, OutcomeTracking

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/draft", tags=["Draft"])


# ── Request / Response Models ─────────────────────────────────────────────────

class DraftRequest(BaseModel):
    scheme_name: str     # e.g. "PMEGP"
    answers: dict        # {question_id: answer_value}
    conversation_id: str | None = None


class RichDraftRequest(BaseModel):
    """New request model for rich, Gemini-generated scheme-specific drafts."""
    scheme_name: str      # e.g. "PMEGP", "Mudra", "ODOP" etc.
    user_input: str       # Free-text from the user (what they want to do)
    conversation_id: str | None = None


class DraftResponse(BaseModel):
    draft_letter: str
    document_checklist: list[str]
    apply_url: str
    scheme_full_name: str
    prefilled_from_profile: bool = False


class RichDraftResponse(BaseModel):
    """Rich response from scheme-specific Gemini generation."""
    scheme_key: str
    scheme_name: str
    subsidy_info: str
    sections: list[str]
    draft_content: str              # Full markdown document
    auto_filled_fields: dict        # Fields successfully auto-filled from profile
    fields_to_update: list[str]     # Fields the user still needs to fill
    document_checklist: list[str]
    apply_url: str


class EligibilityResponse(BaseModel):
    is_eligible: bool
    max_benefit: str
    match_score: int
    reasons: list[str]
    missing_criteria: list[str]


# ── Helper: resolve scheme key from name ──────────────────────────────────────

def _resolve_to_draft_template_key(scheme_name: str) -> str | None:
    """Map user-facing scheme name → DRAFT_PROMPT_TEMPLATES key."""
    # Direct map lookup (e.g. "PMEGP" → "pmegp")
    for display_key, template_key in SCHEME_KEY_MAP.items():
        if display_key.lower() in scheme_name.lower() or scheme_name.lower() in display_key.lower():
            return template_key
    # Fuzzy fallback
    name_lower = scheme_name.lower()
    if "pmegp" in name_lower or "prime minister employment" in name_lower:
        return "pmegp"
    if "mudra" in name_lower or "micro units" in name_lower:
        return "mudra"
    if "stand" in name_lower and "india" in name_lower:
        return "standup_india"
    if "odop" in name_lower or "one district" in name_lower:
        return "odop"
    if "vishwakarma" in name_lower:
        return "vishwakarma"
    return None


# ── Endpoint: Get Questions (legacy) ─────────────────────────────────────────

@router.get("/questions/{scheme_name:path}")
async def get_questions(
    scheme_name: str,
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Return question list for the draft modal form."""
    key, template = resolve_scheme_template(scheme_name)
    if not template:
        raise HTTPException(
            status_code=404,
            detail=f"No draft template for '{scheme_name}'. Supported: PMEGP, Mudra, Stand-Up India, ODOP, Vishwakarma"
        )

    return {
        "scheme_name": key,
        "full_name": template["full_name"],
        "questions": template["questions"],
        "document_checklist": template["document_checklist"],
        "apply_url": template["apply_url"],
    }


# ── Endpoint: Legacy Generate ─────────────────────────────────────────────────

@router.post("/generate", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Legacy endpoint: template-fill based application letter."""
    key, template = resolve_scheme_template(request.scheme_name)
    if not template:
        raise HTTPException(status_code=404, detail=f"Scheme '{request.scheme_name}' is not yet supported")

    # Load user profile for pre-filling
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    profile_data = {}
    if profile:
        profile_data = {
            "applicant_name": getattr(profile, "business_name", ""),
            "address": f"{getattr(profile, 'city', '')}, {getattr(profile, 'state', '')}".strip(" ,"),
            "city": getattr(profile, "city", ""),
            "district": getattr(profile, "city", ""),
            "category": getattr(profile, "category", "General"),
            "business_name": getattr(profile, "business_name", ""),
            "business_type": getattr(profile, "business_type", ""),
        }

    answers = {
        **profile_data,
        **request.answers,
        "current_date": date.today().strftime("%d/%m/%Y"),
        "document_checklist": "\n".join(
            f"{i + 1}. {doc}" for i, doc in enumerate(template["document_checklist"])
        ),
    }

    if not answers.get("city"):
        answers["city"] = answers.get("district") or (answers.get("address", "").split(",")[-1].strip())

    try:
        draft_letter = template["letter_template"].format(**answers)
    except KeyError as missing:
        logger.info(f"Template field {missing} missing — falling back to Gemini fill")
        draft_letter = await _gemini_fill_draft(template, answers, key, str(missing))

    await _save_draft(db, clerk_user_id, key, draft_letter)

    return DraftResponse(
        draft_letter=draft_letter.strip(),
        document_checklist=template["document_checklist"],
        apply_url=template["apply_url"],
        scheme_full_name=template["full_name"],
        prefilled_from_profile=bool(profile and getattr(profile, "onboarding_complete", False))
    )


# ── Endpoint: Rich Gemini-Powered Generate ────────────────────────────────────

@router.post("/generate-rich", response_model=RichDraftResponse)
async def generate_rich_draft(
    request: RichDraftRequest,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """
    NEW: Scheme-specific, Gemini-powered structured application draft.

    Returns a full structured markdown document (project report, loan brief,
    application brief) instead of a generic cover letter.
    Auto-fills from user profile and clearly marks fields that need verification.
    """
    # 1. Resolve scheme → template key
    scheme_key = _resolve_to_draft_template_key(request.scheme_name)
    if not scheme_key or scheme_key not in DRAFT_PROMPT_TEMPLATES:
        raise HTTPException(
            status_code=404,
            detail=f"No rich draft template for '{request.scheme_name}'. "
                   f"Supported: PMEGP, Mudra, Stand-Up India, ODOP, PM Vishwakarma"
        )

    prompt_template = DRAFT_PROMPT_TEMPLATES[scheme_key]

    # 2. Load user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    # 3. Build prompt_data dict — auto-fill what's available
    MISSING = "[TO BE FILLED]"
    prompt_data: dict = {
        "name": MISSING,
        "category": MISSING,
        "city": MISSING,
        "state": "Uttar Pradesh",
        "business_type": MISSING,
        "business_name": MISSING,
        "sector": MISSING,
        "turnover_range": MISSING,
        "udyam_registered": MISSING,
        "existing_loan": MISSING,
        "education_level": MISSING,
        "user_input": request.user_input or "Not provided",
        "additional_docs": "",
        # PMEGP specific defaults
        "subsidy_rate": "15",
        "own_contribution_pct": "10",
    }

    if profile:
        def _s(val) -> str:
            """Return value as string or MISSING sentinel."""
            return str(val).strip() if val else MISSING

        prompt_data.update({
            "name": _s(getattr(profile, "full_name", None) or getattr(profile, "business_name", None)),
            "category": _s(getattr(profile, "category", None)),
            "city": _s(getattr(profile, "city", None)),
            "state": _s(getattr(profile, "state", None)) if getattr(profile, "state", None) else "Uttar Pradesh",
            "business_type": _s(getattr(profile, "business_type", None)),
            "business_name": _s(getattr(profile, "business_name", None)),
            "sector": _s(getattr(profile, "sector", None)),
            "turnover_range": _s(getattr(profile, "turnover_range", None)),
            "udyam_registered": "Yes" if getattr(profile, "udyam_registered", False) else "No",
            "existing_loan": "Yes" if getattr(profile, "existing_loan", False) else "No",
            "education_level": _s(getattr(profile, "primary_goal", None)),
        })

    # 4. Compute PMEGP-specific subsidy rates
    if scheme_key == "pmegp":
        subsidy_info = get_pmegp_subsidy_rate(
            prompt_data.get("category", "General"),
            area="urban"
        )
        prompt_data["subsidy_rate"] = str(subsidy_info["subsidy"])
        prompt_data["own_contribution_pct"] = str(subsidy_info["own_contribution"])

    # 5. Fill prompt template safely (catch missing keys)
    try:
        filled_prompt = prompt_template["prompt"].format(**prompt_data)
    except KeyError as e:
        # Replace None values and retry
        prompt_data = {k: (v if v is not None else MISSING) for k, v in prompt_data.items()}
        try:
            filled_prompt = prompt_template["prompt"].format(**prompt_data)
        except KeyError as e2:
            logger.error(f"Prompt template key missing: {e2}")
            raise HTTPException(status_code=500, detail=f"Draft template error: missing key {e2}")

    # 6. Call Gemini
    logger.info(f"Generating rich draft for scheme={scheme_key}, user={clerk_user_id}")
    draft_content = await gemini_service.generate_response(filled_prompt)

    if not draft_content or draft_content.startswith("I'm temporarily unavailable"):
        raise HTTPException(
            status_code=503,
            detail="Draft generation temporarily unavailable. Please try again."
        )

    # 7. Track auto-filled vs missing fields
    skip_keys = {"user_input", "additional_docs", "subsidy_rate", "own_contribution_pct"}
    auto_filled = {
        k: v for k, v in prompt_data.items()
        if v != MISSING and k not in skip_keys
    }
    fields_to_update = [
        k for k, v in prompt_data.items()
        if v == MISSING and k not in skip_keys
    ]

    # 8. Get document checklist + apply URL from legacy template (if available)
    document_checklist: list[str] = []
    apply_url = "https://msme.gov.in"
    _, legacy_template = resolve_scheme_template(request.scheme_name)
    if legacy_template:
        document_checklist = legacy_template.get("document_checklist", [])
        apply_url = legacy_template.get("apply_url", apply_url)

    # 9. Save draft to DB
    await _save_draft(db, clerk_user_id, scheme_key, draft_content)

    return RichDraftResponse(
        scheme_key=scheme_key,
        scheme_name=prompt_template["display_name"],
        subsidy_info=prompt_template["subsidy_info"],
        sections=prompt_template["output_sections"],
        draft_content=draft_content,
        auto_filled_fields=auto_filled,
        fields_to_update=fields_to_update,
        document_checklist=document_checklist,
        apply_url=apply_url,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _gemini_fill_draft(template: dict, answers: dict, scheme_name: str, missing_field: str) -> str:
    prompt = f"""Generate a formal government scheme application letter for {scheme_name}.

User information:
{json.dumps(answers, indent=2)}

Letter template:
{template['letter_template']}

Rules:
- Fill ALL placeholder fields using the provided information
- For missing field "{missing_field}" infer a reasonable value from context
- Keep formal government letter tone
- Return ONLY the filled letter, no explanation
- Date format: DD/MM/YYYY
"""
    return await gemini_service.generate_response(prompt)


async def _save_draft(db: AsyncSession, clerk_user_id: str, scheme_name: str, draft_letter: str):
    """Upsert draft into user_scheme_interactions for later retrieval."""
    try:
        result = await db.execute(select(Scheme).where(Scheme.name.ilike(f"%{scheme_name}%")))
        scheme = result.scalars().first()
        if not scheme:
            return

        existing = await db.execute(
            select(UserSchemeInteraction).where(
                UserSchemeInteraction.clerk_user_id == clerk_user_id,
                UserSchemeInteraction.scheme_id == scheme.id
            )
        )
        interaction = existing.scalars().first()

        if interaction:
            interaction.draft_letter = draft_letter
            interaction.application_status = "draft_generated"
        else:
            interaction = UserSchemeInteraction(
                clerk_user_id=clerk_user_id,
                scheme_id=scheme.id,
                draft_letter=draft_letter,
                application_status="draft_generated",
                bookmarked=True,
            )
            db.add(interaction)

        await db.commit()

        # Auto-create OutcomeTracking row
        ot_result = await db.execute(
            select(OutcomeTracking).where(
                OutcomeTracking.clerk_user_id == clerk_user_id,
                OutcomeTracking.scheme_id == scheme.id,
            )
        )
        ot = ot_result.scalars().first()
        if not ot:
            ot = OutcomeTracking(
                clerk_user_id=clerk_user_id,
                scheme_id=scheme.id,
                draft_generated=True,
                draft_date=date.today(),
            )
            db.add(ot)
            await db.commit()

    except Exception as e:
        logger.warning(f"Draft save failed (non-fatal): {e}")


# ── Endpoint: Eligibility Check ───────────────────────────────────────────────

@router.get("/eligibility/{scheme_name:path}", response_model=EligibilityResponse)
async def check_eligibility(
    scheme_name: str,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """
    Rule-based eligibility check — no LLM.
    Matches user profile attributes against scheme's eligibility_criteria JSON.
    """
    result = await db.execute(select(Scheme).where(Scheme.name.ilike(f"%{scheme_name[-10:]}%")))
    scheme = result.scalars().first()
    if not scheme:
        raise HTTPException(404, f"Scheme '{scheme_name}' not found in database.")

    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    result_data = rule_check_eligibility(profile, scheme)
    return EligibilityResponse(**result_data)

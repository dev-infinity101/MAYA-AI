"""
routers/draft.py — Application Draft Generator
Generates filled government scheme application letters from user answers.
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
from models import UserSchemeInteraction, Scheme, UserProfile, OutcomeTracking

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/draft", tags=["Draft"])


class DraftRequest(BaseModel):
    scheme_name: str     # e.g. "PMEGP"
    answers: dict        # {question_id: answer_value}
    conversation_id: str | None = None


class DraftResponse(BaseModel):
    draft_letter: str
    document_checklist: list[str]
    apply_url: str
    scheme_full_name: str
    prefilled_from_profile: bool = False

class EligibilityResponse(BaseModel):
    is_eligible: bool
    max_benefit: str
    match_score: int
    reasons: list[str]
    missing_criteria: list[str]


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


@router.post("/generate", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Core endpoint: takes user answers, returns filled application letter."""
    key, template = resolve_scheme_template(request.scheme_name)
    if not template:
        raise HTTPException(status_code=404, detail=f"Scheme '{request.scheme_name}' is not yet supported")

    # Load user profile for pre-filling
    profile_result = await db.execute(
        select(UserProfile).where(
            UserProfile.clerk_user_id == clerk_user_id
        )
    )
    profile = profile_result.scalars().first()

    # Build pre-filled answers from profile
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

    # Merge: profile fills base, request.answers overrides
    answers = {
        **profile_data,          # from DB profile
        **request.answers,       # from modal — takes priority
        "current_date": date.today().strftime("%d/%m/%Y"),
        "document_checklist": "\n".join(
            f"{i + 1}. {doc}" for i, doc in enumerate(template["document_checklist"])
        ),
    }
    
    # Derive city from district or address if still empty
    if not answers.get("city"):
        answers["city"] = answers.get("district") or (answers.get("address", "").split(",")[-1].strip())

    # Try simple str.format() first — no LLM cost
    try:
        draft_letter = template["letter_template"].format(**answers)
    except KeyError as missing:
        logger.info(f"Template field {missing} missing — falling back to Gemini fill")
        draft_letter = await _gemini_fill_draft(template, answers, key, str(missing))

    # Persist draft to user_scheme_interactions
    await _save_draft(db, clerk_user_id, key, draft_letter)

    return DraftResponse(
        draft_letter=draft_letter.strip(),
        document_checklist=template["document_checklist"],
        apply_url=template["apply_url"],
        scheme_full_name=template["full_name"],
        prefilled_from_profile=bool(profile and getattr(profile, "onboarding_complete", False))
    )


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

        # ── Auto-create OutcomeTracking row ──────────────────────────
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

@router.get("/eligibility/{scheme_name:path}", response_model=EligibilityResponse)
async def check_eligibility(
    scheme_name: str,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """
    Rule-based eligibility check — no LLM.
    Matches user profile attributes (category, sector, state, udyam, loan)
    against scheme's eligibility_criteria JSON from the database.
    """
    # Fetch scheme — try exact suffix match first, then broader
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


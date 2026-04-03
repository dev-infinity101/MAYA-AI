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
from data.scheme_templates import SCHEME_TEMPLATES, resolve_scheme_template
from models import UserSchemeInteraction, Scheme, UserProfile

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
    profile = profile_result.scalar_one_or_none()

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
        scheme = result.scalar_one_or_none()
        if not scheme:
            return

        existing = await db.execute(
            select(UserSchemeInteraction).where(
                UserSchemeInteraction.clerk_user_id == clerk_user_id,
                UserSchemeInteraction.scheme_id == scheme.id
            )
        )
        interaction = existing.scalar_one_or_none()

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
    except Exception as e:
        logger.warning(f"Draft save failed (non-fatal): {e}")

@router.get("/eligibility/{scheme_name:path}", response_model=EligibilityResponse)
async def check_eligibility(
    scheme_name: str,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Dynamically calculates scheme eligibility using Gemini based on User Profile."""
    # fetching scheme directly or fallback to template aliases
    result = await db.execute(select(Scheme).where(Scheme.name.ilike(f"%{scheme_name[-10:]}%")))
    scheme = result.scalar_one_or_none()
    
    if not scheme:
        # We need something to test against.
        raise HTTPException(404, f"Scheme '{scheme_name}' not found in database to evaluate.")
        
    profile_result = await db.execute(select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id))
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        profile_data = "No user profile details found (guest or incomplete setup)."
    else:
        profile_data = json.dumps({
            "category": profile.category or "General",
            "business_type": profile.business_type or "Unknown",
            "sector": profile.sector or "Unknown",
            "turnover_range": profile.turnover_range or "Not started",
            "udyam_registered": profile.udyam_registered,
            "existing_loan": profile.existing_loan,
            "state": profile.state or "Unknown",
            "city": profile.city or "Unknown"
        })
        
    prompt = f"""You are an expert Indian Government Scheme Advisor for MSMEs.
User Profile Data: {profile_data}

Scheme Name: {scheme.name}
Scheme Category: {scheme.category}
Scheme Benefits: {scheme.benefits}
Scheme Description / Rules: {scheme.description} 

Evaluate exactly how much benefit THIS specific user can get based on their profile data (e.g. higher subsidy if ST/SC/Women, or specific loan limits based on sector).
Return ONLY valid JSON. Do NOT wrap in ```json markers. 

Schema:
{{
    "is_eligible": true (or false if explicitly rejected by rules),
    "match_score": integer between 0 and 100 representing profile fit,
    "max_benefit": "Text summarizing their maximum possible amount/percent (e.g. 'Up to ₹50 Lakh loan with 35% subsidy')",
    "reasons": ["List 2-3 specific reasons they match based on their profile (e.g. 'Your category ST gives higher subsidy')"],
    "missing_criteria": ["List any missing criteria preventing full eligibility"]
}}
"""
    try:
        response = await gemini_service.generate_response(prompt)
        raw = response.strip()
        if raw.startswith("```json"):
            raw = raw[7:-3].strip()
        elif raw.startswith("```"):
            raw = raw[3:-3].strip()
            
        data = json.loads(raw)
        return EligibilityResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse eligibility: {e} -> Raw: {response}")
        # fallback
        return EligibilityResponse(
            is_eligible=True,
            match_score=85,
            max_benefit="Depends on project cost and assessment",
            reasons=["Your overall business profile aligns with the scheme objectives", "Detailed assessment required with bank"],
            missing_criteria=[]
        )


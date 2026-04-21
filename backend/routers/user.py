from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from database import get_db
from middleware.auth import get_current_user_id
from models import UserProfile, User, UserSchemeInteraction, OutcomeTracking, Scheme
from services.health_score_service import calculate_health_score

router = APIRouter(prefix="/api/user", tags=["user"])


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    sector: Optional[str] = None
    turnover_range: Optional[str] = None
    udyam_registered: Optional[bool] = None
    existing_loan: Optional[bool] = None
    primary_goal: Optional[str] = None
    onboarding_complete: Optional[bool] = None


class OutcomeUpdate(BaseModel):
    scheme_id: int
    submitted: Optional[bool] = None
    approved: Optional[bool] = None
    amount_approved: Optional[int] = None   # in rupees


def _profile_to_dict(profile: UserProfile, user: Optional[User] = None) -> dict:
    """Consistent serializer — used by both GET and POST responses."""
    return {
        "onboarding_complete": bool(profile.onboarding_complete),
        "full_name": profile.full_name,
        "category": profile.category,
        "state": profile.state,
        "city": profile.city,
        "business_name": profile.business_name,
        "business_type": profile.business_type,
        "sector": profile.sector,
        "turnover_range": profile.turnover_range,
        "udyam_registered": profile.udyam_registered,
        "existing_loan": profile.existing_loan,
        "primary_goal": profile.primary_goal,
        "display_name": profile.full_name or (user.name if user else None) or "Business Owner",
        "email": user.email if user else None,
    }


# ── GET /api/user/profile ─────────────────────────────────────────────────────

@router.get("/profile")
async def get_profile(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    user_result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = user_result.scalars().first()

    if not profile:
        return {
            "onboarding_complete": False,
            "display_name": (user.name if user else None) or "Business Owner",
            "email": user.email if user else None,
        }

    return _profile_to_dict(profile, user)


# ── POST /api/user/profile ────────────────────────────────────────────────────

@router.post("/profile")
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    if not profile:
        profile = UserProfile(clerk_user_id=clerk_user_id)
        db.add(profile)

    for field, value in data.model_dump(exclude_none=True).items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    user_result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = user_result.scalars().first()

    return {"status": "saved", "profile": _profile_to_dict(profile, user)}


# ── GET /api/user/health-score ────────────────────────────────────────────────

@router.get("/health-score")
async def get_health_score(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Returns the rule-based Business Health Score (0-100) for the current user."""
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalars().first()

    # Count scheme interactions (bookmarks / drafts generated)
    count_result = await db.execute(
        select(func.count()).select_from(UserSchemeInteraction).where(
            UserSchemeInteraction.clerk_user_id == clerk_user_id
        )
    )
    interactions_count = count_result.scalar_one() or 0

    score_data = calculate_health_score(profile, interactions_count)
    return score_data


# ── GET /api/user/impact-stats ────────────────────────────────────────────────

@router.get("/impact-stats")
async def get_impact_stats(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """Aggregated impact numbers for the Impact Dashboard."""
    # Drafts generated
    drafts_result = await db.execute(
        select(func.count()).select_from(OutcomeTracking).where(
            OutcomeTracking.clerk_user_id == clerk_user_id,
            OutcomeTracking.draft_generated == True,
        )
    )
    drafts_count = drafts_result.scalar_one() or 0

    # Submitted
    submitted_result = await db.execute(
        select(func.count()).select_from(OutcomeTracking).where(
            OutcomeTracking.clerk_user_id == clerk_user_id,
            OutcomeTracking.submitted == True,
        )
    )
    submitted_count = submitted_result.scalar_one() or 0

    # Unique schemes accessed (interactions)
    schemes_result = await db.execute(
        select(func.count()).select_from(UserSchemeInteraction).where(
            UserSchemeInteraction.clerk_user_id == clerk_user_id
        )
    )
    schemes_count = schemes_result.scalar_one() or 0

    # Total funding approved (in ₹ rupees, convert to lakhs for display)
    funding_result = await db.execute(
        select(func.coalesce(func.sum(OutcomeTracking.amount_approved), 0)).where(
            OutcomeTracking.clerk_user_id == clerk_user_id,
            OutcomeTracking.approved == True,
        )
    )
    total_funding_rupees = funding_result.scalar_one() or 0
    funding_lakhs = round(total_funding_rupees / 100_000, 1)

    return {
        "drafts": drafts_count,
        "submitted": submitted_count,
        "schemes": schemes_count,
        "funding_lakhs": funding_lakhs,
    }


# ── GET /api/user/pending-followups ──────────────────────────────────────────

@router.get("/pending-followups")
async def get_pending_followups(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """
    Returns schemes where a draft was generated 30+ days ago but no
    outcome has been reported — triggers the 'Did you submit?' banner.
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    result = await db.execute(
        select(UserSchemeInteraction, Scheme).join(
            Scheme, UserSchemeInteraction.scheme_id == Scheme.id, isouter=True
        ).where(
            UserSchemeInteraction.clerk_user_id == clerk_user_id,
            UserSchemeInteraction.application_status == "draft_generated",
            UserSchemeInteraction.updated_at <= thirty_days_ago,
        )
    )
    rows = result.all()

    followups = []
    for interaction, scheme in rows:
        # Check if we already have an outcome entry for this
        outcome_result = await db.execute(
            select(OutcomeTracking).where(
                OutcomeTracking.clerk_user_id == clerk_user_id,
                OutcomeTracking.scheme_id == interaction.scheme_id,
            )
        )
        outcome = outcome_result.scalars().first()
        if not outcome or not outcome.submitted:
            followups.append({
                "scheme_id": interaction.scheme_id,
                "scheme_name": scheme.name if scheme else "Unknown Scheme",
                "draft_date": interaction.updated_at.isoformat() if interaction.updated_at else None,
            })

    return {"followups": followups}


# ── POST /api/user/outcome ────────────────────────────────────────────────────

@router.post("/outcome")
async def update_outcome(
    data: OutcomeUpdate,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """User reports a real-world outcome (submitted / approved) for a scheme."""
    result = await db.execute(
        select(OutcomeTracking).where(
            OutcomeTracking.clerk_user_id == clerk_user_id,
            OutcomeTracking.scheme_id == data.scheme_id,
        )
    )
    outcome = result.scalars().first()

    if not outcome:
        outcome = OutcomeTracking(
            clerk_user_id=clerk_user_id,
            scheme_id=data.scheme_id,
            draft_generated=True,
            draft_date=datetime.utcnow(),
        )
        db.add(outcome)

    if data.submitted is not None:
        outcome.submitted = data.submitted
        if data.submitted:
            outcome.submit_date = datetime.utcnow()

    if data.approved is not None:
        outcome.approved = data.approved

    if data.amount_approved is not None:
        outcome.amount_approved = data.amount_approved

    await db.commit()
    return {"status": "updated"}

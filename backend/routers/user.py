from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from database import get_db
from middleware.auth import get_current_user_id
from models import UserProfile, User

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
        # display_name: prefer profile full_name, fall back to Clerk user name
        "display_name": profile.full_name or (user.name if user else None) or "Business Owner",
        "email": user.email if user else None,
    }


@router.get("/profile")
async def get_profile(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalar_one_or_none()

    user_result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = user_result.scalar_one_or_none()

    if not profile:
        # User exists but no profile yet — onboarding not started
        return {
            "onboarding_complete": False,
            "display_name": (user.name if user else None) or "Business Owner",
            "email": user.email if user else None,
        }

    return _profile_to_dict(profile, user)


@router.post("/profile")
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(clerk_user_id=clerk_user_id)
        db.add(profile)

    # Update only the fields that were supplied in the request body
    for field, value in data.model_dump(exclude_none=True).items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    user_result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = user_result.scalar_one_or_none()

    return {"status": "saved", "profile": _profile_to_dict(profile, user)}

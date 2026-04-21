import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from middleware.auth import get_current_user_id
from models import UserProfile, Scheme
from agents.scheme_trajectory import generate_trajectory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])


@router.get("/trajectory")
async def get_scheme_trajectory(
    clerk_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a personalized scheme growth roadmap for the authenticated user.
    Pure rule engine — no LLM calls, responds in <50ms.
    """
    try:
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
        )
        profile = profile_result.scalars().first()

        if not profile or not profile.onboarding_complete:
            return {
                "current_eligible_count": 0,
                "trajectory": [],
                "message": "Complete onboarding to see your personalised roadmap",
            }

        profile_dict = {
            "udyam_registered": profile.udyam_registered,
            "turnover_range": profile.turnover_range,
            "existing_loan": profile.existing_loan,
            "sector": profile.sector,
            "category": profile.category,
            "business_type": profile.business_type,
            "city": profile.city,
            "state": profile.state,
        }

        trajectory = generate_trajectory(profile_dict)

        count_result = await db.execute(select(func.count()).select_from(Scheme))
        scheme_count = count_result.scalar() or 0

        return {
            "current_eligible_count": scheme_count,
            "trajectory": trajectory,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trajectory engine error for {clerk_user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not generate trajectory")

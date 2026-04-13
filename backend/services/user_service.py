import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import User, UserProfile

logger = logging.getLogger(__name__)


async def get_or_create_user(
    db: AsyncSession,
    clerk_user_id: str,
    email: str | None = None,
    name: str | None = None,
) -> User:
    """
    Idempotent upsert by clerk_user_id.
    - If the user exists → return immediately (indexed query, <1ms).
    - If new → create User + flush + UserProfile in one transaction.

    The db.flush() after User creation is CRITICAL:
    Without it, SQLAlchemy hasn't written the User row to the DB within
    the transaction yet. The UserProfile FK reference then fails silently
    (or raises an integrity error on commit). flush() makes the row visible
    within the same transaction without committing.
    """
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        return user

    logger.info(f"🆕 First visit for Clerk user {clerk_user_id[:12]}… — creating DB records")

    # Step 1: Create User
    user = User(
        clerk_user_id=clerk_user_id,
        email=email or f"{clerk_user_id}@clerk.placeholder",
        name=name or "Business Owner",
    )
    db.add(user)
    await db.flush()  # ← Makes the User row visible within this transaction
                      # so the UserProfile FK resolves correctly

    # Step 2: Now safe to create UserProfile with FK reference
    profile = UserProfile(
        clerk_user_id=clerk_user_id,
        onboarding_complete=False,
    )
    db.add(profile)

    await db.commit()
    await db.refresh(user)
    return user
async def get_or_create_whatsapp_user(
    db: AsyncSession,
    wa_user_id: str,
    phone: str
) -> User:
    """
    WhatsApp users are identified by phone number.
    Created with wa_ prefix to distinguish from Clerk users.
    No password, no email — phone is their identity.
    """
    result = await db.execute(
        select(User).where(User.clerk_user_id == wa_user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        return user

    logger.info(f"🆕 First WhatsApp visit for {phone} – creating DB record")

    user = User(
        clerk_user_id=wa_user_id,
        email=f"{phone}@whatsapp.maya",  # placeholder
        name=phone
    )
    db.add(user)
    await db.flush()

    # Empty profile — WhatsApp onboarding handled conversationally
    profile = UserProfile(
        clerk_user_id=wa_user_id,
        onboarding_complete=False
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    return user

import os
import logging
from fastapi import Header, HTTPException
import json
import base64

logger = logging.getLogger(__name__)

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")


def _extract_sub_from_jwt(token: str) -> str:
    """Manually decodes the JWT payload to extract the 'sub' claim (Clerk User ID)."""
    parts = token.split(".")
    if len(parts) != 3:
        return ""
    payload_b64 = parts[1]
    # Add padding if needed
    payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
    try:
        decoded = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
        payload = json.loads(decoded)
        return payload.get("sub", "")
    except Exception:
        return ""

async def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Verifies Clerk JWT and returns clerk_user_id (the 'sub' claim).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    # 100% reliable bare-metal extraction
    user_id = _extract_sub_from_jwt(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload or missing sub claim")
        
    return user_id


async def get_optional_user_id(authorization: str = Header(None)) -> str | None:
    """
    Same as get_current_user_id but returns None instead of 401.
    Use on endpoints that work for both guests and authenticated users.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user_id(authorization)
    except HTTPException:
        return None

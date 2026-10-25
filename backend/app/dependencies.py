import httpx
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from app.config import settings

# In-memory session cache to avoid redundant Supabase auth network calls
_AUTH_CACHE: Dict[str, Dict[str, Any]] = {}

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Validates Supabase access token from Authorization header (Bearer <token>).
    Returns user payload dictionary containing 'id', 'email', and 'role'.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split("Bearer ", 1)[1].strip()

    # Check cache
    if token in _AUTH_CACHE:
        return _AUTH_CACHE[token]

    # If Supabase URL is configured, verify against Supabase Auth API
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{settings.SUPABASE_URL}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": settings.SUPABASE_ANON_KEY
                    }
                )
                if res.status_code == 200:
                    user_data = res.json()
                    user_info = {
                        "id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "role": user_data.get("role", "authenticated"),
                        "app_metadata": user_data.get("app_metadata", {}),
                        "user_metadata": user_data.get("user_metadata", {})
                    }
                    _AUTH_CACHE[token] = user_info
                    return user_info
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid, expired, or revoked Supabase session token.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
        except httpx.RequestError as exc:
            # If network error connecting to Supabase during local test, allow local dev fallback
            if settings.DEMO_MODE and token.startswith("demo-"):
                demo_user = {
                    "id": token.replace("demo-", ""),
                    "email": "demo.user@safesignal.org",
                    "role": "authenticated"
                }
                return demo_user
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to verify authentication with Supabase: {str(exc)}"
            )

    # Demo / local development mode when Supabase credentials are not yet supplied
    if settings.DEMO_MODE:
        # Use token value or predictable uuid for demo testing
        user_id = token if len(token) > 10 else "00000000-0000-0000-0000-000000000001"
        demo_user = {
            "id": user_id,
            "email": "demo.safety@safesignal.local",
            "role": "authenticated",
            "is_demo_session": True
        }
        return demo_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Supabase credentials not configured and demo mode is disabled.",
        headers={"WWW-Authenticate": "Bearer"},
    )

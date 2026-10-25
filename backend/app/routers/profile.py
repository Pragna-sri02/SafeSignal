from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import UserProfileResponse, UserProfileUpdate
from app.dependencies import get_current_user
from app.services.store_service import store

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.get("", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    email = current_user.get("email")
    profile = store.get_profile(user_id, email=email)
    return profile

@router.put("", response_model=UserProfileResponse)
async def update_profile(
    updates: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    clean_updates = {k: v for k, v in updates.model_dump().items() if v is not None}
    updated_profile = store.update_profile(user_id, clean_updates)
    return updated_profile

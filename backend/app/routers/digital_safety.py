from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import DigitalCategoryGuidance
from app.services.safety_service import (
    get_digital_safety_categories,
    get_digital_category_by_id
)

router = APIRouter(prefix="/api/digital", tags=["Digital Safety Guided Playbooks"])

@router.get("/categories", response_model=List[DigitalCategoryGuidance])
async def list_digital_safety_categories():
    """
    Returns all 8 interactive digital protection guides covering compromised accounts,
    cyberbullying, impersonation, deepfakes, extortion, tracking, and image misuse.
    """
    return get_digital_safety_categories()

@router.get("/categories/{category_id}", response_model=DigitalCategoryGuidance)
async def get_digital_category_detail(category_id: str):
    """
    Returns the specific checklist, legal provisions, and recovery links for a category.
    """
    cat = get_digital_category_by_id(category_id)
    if not cat:
        raise HTTPException(
            status_code=404,
            detail=f"Category '{category_id}' not found in Digital Protection Centre."
        )
    return cat

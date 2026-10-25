from typing import List
from fastapi import APIRouter
from app.models.schemas import HelpResourceItem
from app.services.safety_service import get_help_directory_resources

router = APIRouter(prefix="/api/help", tags=["Trusted Help Directory"])

@router.get("/directory", response_model=List[HelpResourceItem])
async def list_help_directory_resources():
    """
    Returns verified, official helpline numbers and emergency resources in India,
    including 112 (ERSS), 181 (Women Helpline), 1930 (Cybercrime), NCW, iCALL, and StopNCII.
    """
    return get_help_directory_resources()

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    TrustedContactCreate,
    TrustedContactUpdate,
    TrustedContactResponse,
    StandardResponse
)
from app.dependencies import get_current_user
from app.services.store_service import store
from app.services.notification_service import notification_service

router = APIRouter(prefix="/api/contacts", tags=["Trusted Contacts"])

@router.get("", response_model=List[TrustedContactResponse])
async def list_trusted_contacts(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return store.get_contacts(user_id)

@router.post("", response_model=TrustedContactResponse, status_code=status.HTTP_201_CREATED)
async def create_trusted_contact(
    contact: TrustedContactCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    new_contact = store.add_contact(user_id, contact.model_dump())
    return new_contact

@router.put("/{contact_id}", response_model=TrustedContactResponse)
async def update_trusted_contact(
    contact_id: str,
    contact_update: TrustedContactUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    clean_updates = {k: v for k, v in contact_update.model_dump().items() if v is not None}
    updated = store.update_contact(user_id, contact_id, clean_updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Trusted contact not found or unauthorized.")
    return updated

@router.delete("/{contact_id}", response_model=StandardResponse)
async def delete_trusted_contact(
    contact_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    deleted = store.delete_contact(user_id, contact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trusted contact not found or unauthorized.")
    return StandardResponse(success=True, message="Trusted contact successfully deleted.")

@router.post("/{contact_id}/test-demo", response_model=StandardResponse)
async def test_demo_notification(
    contact_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    contacts = store.get_contacts(user_id)
    target = next((c for c in contacts if c["id"] == contact_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Contact not found.")

    events = notification_service.dispatch_sos_alerts(
        incident_id="demo-test",
        user_id=user_id,
        contacts=[target],
        custom_message="TEST: SafeSignal demo safety alert check."
    )
    return StandardResponse(
        success=True,
        message=f"Test simulated notification logged for {target['full_name']} in Demo Mode. (No charges or live SMS incurred).",
        data={"events": [e.model_dump() for e in events]}
    )

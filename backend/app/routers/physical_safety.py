import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    SOSActivationRequest,
    SOSCancelRequest,
    SOSIncidentResponse,
    JourneyCheckinCreate,
    JourneyCheckinUpdate,
    JourneyCheckinResponse,
    StandardResponse
)
from app.dependencies import get_current_user
from app.services.store_service import store
from app.services.notification_service import notification_service

router = APIRouter(prefix="/api/physical", tags=["Physical Safety & Journey"])

# --- SOS Workflow ---

@router.post("/sos/activate", response_model=SOSIncidentResponse, status_code=status.HTTP_201_CREATED)
async def activate_emergency_sos(
    payload: SOSActivationRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    incident_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # Fetch user's trusted contacts
    all_contacts = store.get_contacts(user_id)
    # If specific recipients were requested, filter them; otherwise take all SOS recipients
    if payload.recipient_contact_ids:
        recipients = [c for c in all_contacts if c["id"] in payload.recipient_contact_ids]
    else:
        recipients = [c for c in all_contacts if c.get("is_sos_recipient", True)]

    # Dispatch alerts through notification service layer
    notification_events = notification_service.dispatch_sos_alerts(
        incident_id=incident_id,
        user_id=user_id,
        contacts=recipients,
        location_data={
            "lat": payload.location_lat,
            "lng": payload.location_lng,
            "accuracy": payload.location_accuracy,
            "address": payload.address_text
        }
    )

    incident_record = {
        "id": incident_id,
        "user_id": user_id,
        "incident_type": "sos",
        "status": "Sent",
        "location_lat": payload.location_lat,
        "location_lng": payload.location_lng,
        "location_accuracy": payload.location_accuracy,
        "address_text": payload.address_text or "",
        "is_demo": True,  # Clearly identified demo mode
        "cancelled_at": None,
        "cancel_reason": None,
        "created_at": now,
        "updated_at": now,
        "notifications": [e.model_dump() for e in notification_events]
    }

    store.add_incident(user_id, incident_record)
    return incident_record

@router.post("/sos/{incident_id}/cancel", response_model=StandardResponse)
async def cancel_emergency_sos(
    incident_id: str,
    payload: SOSCancelRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    updated = store.update_incident(user_id, incident_id, {
        "status": "Cancelled",
        "cancelled_at": now,
        "cancel_reason": payload.cancel_reason
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found or unauthorized.")
    return StandardResponse(
        success=True,
        message="SOS activation safely cancelled. Incident marked as resolved/false alarm."
    )

@router.get("/sos/latest", response_model=Optional[SOSIncidentResponse])
async def get_latest_sos_incident(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    incident = store.get_latest_incident(user_id)
    return incident

# --- Journey Safety Workflow ---

@router.post("/journey/start", response_model=JourneyCheckinResponse, status_code=status.HTTP_201_CREATED)
async def start_journey(
    payload: JourneyCheckinCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)

    # Check if there is already an active journey
    active = store.get_active_journey(user_id)
    if active:
        # Mark previous as cancelled or complete before starting a new one
        store.update_journey(user_id, active["id"], {"status": "completed"})

    journey_id = str(uuid.uuid4())
    journey_record = {
        "id": journey_id,
        "user_id": user_id,
        "destination_name": payload.destination_name,
        "expected_arrival_time": payload.expected_arrival_time,
        "status": "active",
        "last_checkin_time": now,
        "checkin_interval_minutes": payload.checkin_interval_minutes,
        "notify_contacts_on_overdue": payload.notify_contacts_on_overdue,
        "start_lat": payload.start_lat,
        "start_lng": payload.start_lng,
        "notes": payload.notes or "",
        "created_at": now,
        "updated_at": now
    }

    store.add_journey(user_id, journey_record)
    return journey_record

@router.put("/journey/{journey_id}/checkin", response_model=JourneyCheckinResponse)
async def manual_journey_checkin(
    journey_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    updated = store.update_journey(user_id, journey_id, {
        "last_checkin_time": now,
        "status": "active"
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Journey not found.")
    return updated

@router.put("/journey/{journey_id}/complete", response_model=JourneyCheckinResponse)
async def complete_journey(
    journey_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    updated = store.update_journey(user_id, journey_id, {
        "status": "completed"
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Journey not found.")
    return updated

@router.put("/journey/{journey_id}/cancel", response_model=JourneyCheckinResponse)
async def cancel_journey(
    journey_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    updated = store.update_journey(user_id, journey_id, {
        "status": "cancelled"
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Journey not found.")
    return updated

@router.get("/journey/active", response_model=Optional[JourneyCheckinResponse])
async def get_active_journey(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return store.get_active_journey(user_id)

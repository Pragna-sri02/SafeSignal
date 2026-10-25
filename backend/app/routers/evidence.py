import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from app.models.schemas import (
    EvidenceRecordCreate,
    EvidenceRecordUpdate,
    EvidenceRecordResponse,
    StandardResponse
)
from app.dependencies import get_current_user
from app.services.store_service import store

router = APIRouter(prefix="/api/evidence", tags=["Evidence Organizer"])

@router.get("", response_model=List[EvidenceRecordResponse])
async def list_evidence_records(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    return store.get_evidence(user_id, category=category, search=search)

@router.post("", response_model=EvidenceRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_evidence_record(
    payload: EvidenceRecordCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    record_id = str(uuid.uuid4())

    record = {
        "id": record_id,
        "user_id": user_id,
        "title": payload.title,
        "category": payload.category,
        "incident_date": payload.incident_date or now,
        "platform_name": payload.platform_name or "",
        "suspect_identifier": payload.suspect_identifier or "",
        "incident_url": payload.incident_url or "",
        "description": payload.description,
        "notes": payload.notes or "",
        "reporting_status": payload.reporting_status or "evidence_preserved",
        "file_attachments": payload.file_attachments or [],
        "created_at": now,
        "updated_at": now
    }

    store.add_evidence(user_id, record)
    return record

@router.get("/{record_id}", response_model=EvidenceRecordResponse)
async def get_evidence_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    record = store.get_evidence_by_id(user_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Evidence record not found.")
    return record

@router.put("/{record_id}", response_model=EvidenceRecordResponse)
async def update_evidence_record(
    record_id: str,
    payload: EvidenceRecordUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    clean_updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = store.update_evidence(user_id, record_id, clean_updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Evidence record not found.")
    return updated

@router.delete("/{record_id}", response_model=StandardResponse)
async def delete_evidence_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    deleted = store.delete_evidence(user_id, record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Evidence record not found.")
    return StandardResponse(success=True, message="Evidence record permanently removed.")

@router.get("/{record_id}/summary", response_class=PlainTextResponse)
async def export_incident_summary(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a structured, printable text summary ready for submission to
    the National Cyber Crime Reporting Portal (cybercrime.gov.in) or local police station.
    """
    user_id = current_user["id"]
    record = store.get_evidence_by_id(user_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Evidence record not found.")

    profile = store.get_profile(user_id)
    complainant_name = profile.get("full_name") or "Confidential Complainant"

    summary_text = f"""================================================================================
SAFESIGNAL - CONFIDENTIAL INCIDENT EVIDENCE SUMMARY
Generated for: Formal Police Complaint / Cybercrime Reporting Portal
Report Reference ID: {record['id']}
Generated At: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
================================================================================

1. COMPLAINANT INFORMATION
--------------------------
Name: {complainant_name}
Platform ID: SafeSignal Verified Account

2. INCIDENT DETAILS
-------------------
Incident Title: {record['title']}
Category: {record['category'].upper().replace('_', ' ')}
Date & Time of Occurrence: {record['incident_date']}
Current Status: {record['reporting_status'].upper()}

3. DIGITAL FOOTPRINT & SUSPECT DETAILS
--------------------------------------
Platform / Service Involved: {record['platform_name'] or 'Not Specified'}
Suspect Handle / Profile / Phone: {record['suspect_identifier'] or 'Unknown / Masked'}
Offending Content URL: {record['incident_url'] or 'N/A'}

4. DETAILED CHRONOLOGY & DESCRIPTION
------------------------------------
{record['description']}

5. EVIDENCE NOTES & FORENSIC OBSERVATIONS
-----------------------------------------
{record['notes'] or 'Screenshots and raw transcripts preserved in user encrypted vault.'}

Attachments Logged: {len(record.get('file_attachments', []))} file(s) on record.

================================================================================
DISCLAIMER & LEGAL CITATION:
This document is an organized incident summary generated by the complainant via
the SafeSignal Platform. Under Section 65B of the Indian Evidence Act, 1872 /
Bharatiya Sakshya Adhiniyam, digital evidence preserved with timestamps and
metadata should be accompanied by the prescribed certificate when submitted to court.
================================================================================
"""
    return summary_text

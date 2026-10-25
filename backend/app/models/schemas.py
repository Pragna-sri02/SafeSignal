from datetime import datetime
from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Graceful standard-library fallback for bare environments before pip install
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        def dict(self):
            return self.model_dump()
    def Field(default=None, **kwargs):
        return default


# --- Base Models ---

class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

# --- User Profile ---

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    emergency_note: Optional[str] = Field(None, max_length=500)
    safety_checkin_frequency: Optional[int] = Field(30, ge=5, le=360)
    is_onboarding_completed: Optional[bool] = None

class UserProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: str
    phone_number: str
    emergency_note: str
    safety_checkin_frequency: int
    is_onboarding_completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Trusted Contacts ---

class TrustedContactCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=7, max_length=20)
    relationship: str = Field("Family", max_length=50)
    is_sos_recipient: bool = True
    email: Optional[str] = Field("", max_length=100)
    notify_by_sms: bool = True
    notify_by_call: bool = False

class TrustedContactUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone_number: Optional[str] = Field(None, min_length=7, max_length=20)
    relationship: Optional[str] = Field(None, max_length=50)
    is_sos_recipient: Optional[bool] = None
    email: Optional[str] = Field(None, max_length=100)
    notify_by_sms: Optional[bool] = None
    notify_by_call: Optional[bool] = None

class TrustedContactResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    phone_number: str
    relationship: str
    is_sos_recipient: bool
    email: str
    notify_by_sms: bool
    notify_by_call: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Physical Safety & SOS ---

class SOSActivationRequest(BaseModel):
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_accuracy: Optional[float] = None
    address_text: Optional[str] = ""
    recipient_contact_ids: Optional[List[str]] = None
    details: Optional[Dict[str, Any]] = None

class SOSCancelRequest(BaseModel):
    cancel_reason: str = Field("Accidental trigger", max_length=250)

class NotificationEventItem(BaseModel):
    id: str
    channel: str
    recipient_name: str
    recipient_phone: str
    delivery_status: str
    provider_name: str
    created_at: Optional[datetime] = None

class SOSIncidentResponse(BaseModel):
    id: str
    user_id: str
    incident_type: str
    status: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_accuracy: Optional[float] = None
    address_text: Optional[str] = ""
    is_demo: bool
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    notifications: List[NotificationEventItem] = []

# --- Journey Safety ---

class JourneyCheckinCreate(BaseModel):
    destination_name: str = Field(..., min_length=2, max_length=150)
    expected_arrival_time: datetime
    checkin_interval_minutes: int = Field(30, ge=5, le=180)
    notify_contacts_on_overdue: bool = True
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    notes: Optional[str] = Field("", max_length=500)

class JourneyCheckinUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(active|completed|cancelled|overdue|escalated)$")
    last_checkin_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

class JourneyCheckinResponse(BaseModel):
    id: str
    user_id: str
    destination_name: str
    expected_arrival_time: datetime
    status: str
    last_checkin_time: datetime
    checkin_interval_minutes: int
    notify_contacts_on_overdue: bool
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    notes: str
    created_at: datetime
    updated_at: datetime

# --- Evidence Records ---

class EvidenceRecordCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    category: str = Field(..., pattern="^(hacked_account|cyberbullying|impersonation|deepfake|threats_blackmail|privacy_breach|suspicious_activity|image_misuse|physical_incident|other)$")
    incident_date: Optional[datetime] = None
    platform_name: Optional[str] = Field("", max_length=100)
    suspect_identifier: Optional[str] = Field("", max_length=150)
    incident_url: Optional[str] = Field("", max_length=500)
    description: str = Field(..., min_length=5)
    notes: Optional[str] = Field("", max_length=2000)
    reporting_status: Optional[str] = Field("evidence_preserved", pattern="^(draft|evidence_preserved|reported_to_platform|reported_to_cybercrime|resolved)$")
    file_attachments: Optional[List[Dict[str, Any]]] = []

class EvidenceRecordUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    category: Optional[str] = Field(None, pattern="^(hacked_account|cyberbullying|impersonation|deepfake|threats_blackmail|privacy_breach|suspicious_activity|image_misuse|physical_incident|other)$")
    incident_date: Optional[datetime] = None
    platform_name: Optional[str] = Field(None, max_length=100)
    suspect_identifier: Optional[str] = Field(None, max_length=150)
    incident_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, min_length=5)
    notes: Optional[str] = Field(None, max_length=2000)
    reporting_status: Optional[str] = Field(None, pattern="^(draft|evidence_preserved|reported_to_platform|reported_to_cybercrime|resolved)$")
    file_attachments: Optional[List[Dict[str, Any]]] = None

class EvidenceRecordResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    incident_date: datetime
    platform_name: str
    suspect_identifier: str
    incident_url: str
    description: str
    notes: str
    reporting_status: str
    file_attachments: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime

# --- AI Assistant & RAG ---

class SourceCitationModel(BaseModel):
    title: str
    source_url: str
    publisher: str
    snippet: str
    category: Optional[str] = None
    relevance_score: Optional[float] = None

class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1000)
    conversation_history: Optional[List[Dict[str, str]]] = []

class AssistantChatResponse(BaseModel):
    answer: str
    citations: List[SourceCitationModel] = []
    is_urgent: bool = False
    emergency_options_provided: bool = False
    generated_by: str = "gemini-rag"
    suggested_actions: List[str] = []

# --- Digital Protection & Help Directory ---

class DigitalChecklistItem(BaseModel):
    id: str
    title: str
    detail: str
    is_essential: bool = True

class DigitalCategoryGuidance(BaseModel):
    id: str
    title: str
    summary: str
    immediate_considerations: List[str]
    response_checklist: List[DigitalChecklistItem]
    security_privacy_actions: List[str]
    evidence_preservation_tips: List[str]
    official_reporting_links: List[Dict[str, str]]
    statutory_legal_references: List[str]

class HelpResourceItem(BaseModel):
    id: str
    name: str
    purpose: str
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    category: str
    operating_hours: str
    coverage_area: str
    usage_instructions: str
    is_emergency: bool = False

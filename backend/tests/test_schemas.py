from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from app.models.schemas import (
    TrustedContactCreate,
    SOSActivationRequest,
    EvidenceRecordCreate,
    AssistantChatRequest
)

def test_trusted_contact_create_validation():
    # Valid contact
    contact = TrustedContactCreate(
        full_name="Sister Name",
        phone_number="+91 9876543210",
        relationship="Sister"
    )
    assert contact.full_name == "Sister Name"
    assert contact.is_sos_recipient is True

    # Invalid empty name
    with pytest.raises(ValidationError):
        TrustedContactCreate(
            full_name="",
            phone_number="1234567"
        )

def test_sos_activation_request():
    req = SOSActivationRequest(
        location_lat=28.6139,
        location_lng=77.2090,
        location_accuracy=10.5,
        address_text="Connaught Place, New Delhi"
    )
    assert req.location_lat == 28.6139
    assert req.address_text == "Connaught Place, New Delhi"

def test_evidence_record_validation():
    record = EvidenceRecordCreate(
        title="Unauthorized password reset notifications",
        category="suspicious_activity",
        description="Received 5 unexpected password reset SMS codes at 2:00 AM."
    )
    assert record.category == "suspicious_activity"
    assert record.reporting_status == "evidence_preserved"

    # Invalid category
    with pytest.raises(ValidationError):
        EvidenceRecordCreate(
            title="Test",
            category="invalid_category_xyz",
            description="Details here"
        )

def test_assistant_chat_request():
    req = AssistantChatRequest(message="What should I do if my account is hacked?")
    assert len(req.message) > 5

    with pytest.raises(ValidationError):
        AssistantChatRequest(message=" ")

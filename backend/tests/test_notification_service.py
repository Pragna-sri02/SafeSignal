from app.services.notification_service import NotificationService

def test_demo_notification_workflow():
    service = NotificationService(demo_mode=True)
    sample_contacts = [
        {"id": "c1", "full_name": "Mom", "phone_number": "+919876543210", "notify_by_sms": True},
        {"id": "c2", "full_name": "Friend", "phone_number": "+919876543211", "notify_by_sms": False}
    ]

    events = service.dispatch_sos_alerts(
        incident_id="test-inc-1",
        user_id="u1",
        contacts=sample_contacts
    )

    assert len(events) == 2
    # Ensure truthful status reporting: must be 'demo_mode' when in demo mode, never falsely claiming live delivery
    assert events[0].delivery_status == "demo_mode"
    assert events[0].provider_name == "SafeSignal_Demo_Dispatch_Layer"
    assert events[0].recipient_name == "Mom"

def test_journey_overdue_alert():
    service = NotificationService(demo_mode=True)
    sample_contacts = [{"id": "c1", "full_name": "Emergency Contact", "phone_number": "+919876543210"}]

    events = service.dispatch_journey_overdue_alert(
        journey_id="j1",
        user_id="u1",
        destination_name="Central Railway Station",
        contacts=sample_contacts
    )

    assert len(events) == 1
    assert events[0].delivery_status == "demo_mode"

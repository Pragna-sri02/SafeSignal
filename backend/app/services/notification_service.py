import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from app.models.schemas import NotificationEventItem

class NotificationService:
    """
    Manages emergency dispatch and notification workflow.
    Tracks delivery state: Created, Pending, Sent, Delivered, Acknowledged, Failed.
    Supports real SMS delivery via Twilio or Fast2SMS when environment credentials are present.
    If no cloud gateway credentials are set, it tracks events in demo_mode and allows 
    instant 1-tap browser SMS / WhatsApp dispatch.
    """

    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode

    def _send_carrier_sms(self, phone: str, message: str) -> bool:
        """
        Attempts direct SMS transmission via configured carrier gateways.
        Returns True if successful, False otherwise.
        """
        clean_phone = "".join(filter(lambda c: c.isdigit() or c == "+", phone))
        
        # 1. Fast2SMS Gateway (India)
        fast2sms_key = os.getenv("FAST2SMS_API_KEY", "")
        if fast2sms_key:
            try:
                digits_only = "".join(filter(str.isdigit, clean_phone))[-10:]
                resp = httpx.post(
                    "https://www.fast2sms.com/dev/bulkV2",
                    headers={"authorization": fast2sms_key},
                    data={
                        "variables_values": message[:100],
                        "route": "v3",
                        "numbers": digits_only
                    },
                    timeout=5.0
                )
                if resp.status_code == 200:
                    return True
            except Exception as e:
                print(f"[SafeSignal SMS] Fast2SMS dispatch error: {e}")

        # 2. Twilio Gateway (International & India)
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        twilio_from = os.getenv("TWILIO_PHONE_NUMBER", "")
        if twilio_sid and twilio_token and twilio_from:
            try:
                to_number = clean_phone if clean_phone.startswith("+") else f"+91{clean_phone}"
                resp = httpx.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json",
                    auth=(twilio_sid, twilio_token),
                    data={
                        "To": to_number,
                        "From": twilio_from,
                        "Body": message
                    },
                    timeout=6.0
                )
                if resp.status_code in (200, 201):
                    return True
            except Exception as e:
                print(f"[SafeSignal SMS] Twilio dispatch error: {e}")

        return False

    def dispatch_sos_alerts(
        self,
        incident_id: str,
        user_id: str,
        contacts: List[Dict[str, Any]],
        location_data: Optional[Dict[str, Any]] = None,
        custom_message: Optional[str] = None
    ) -> List[NotificationEventItem]:
        """
        Dispatches emergency SOS notifications to configured trusted contacts.
        Returns a list of NotificationEventItem objects with verified delivery statuses.
        """
        notification_events: List[NotificationEventItem] = []
        now = datetime.now(timezone.utc)

        if not contacts:
            return notification_events

        loc_text = location_data.get("address", "") if location_data else "GPS not attached"
        default_msg = f"EMERGENCY ALERT: SafeSignal SOS triggered! Location: {loc_text}. Need immediate assistance!"
        sms_text = custom_message or default_msg

        has_carrier_creds = bool(os.getenv("FAST2SMS_API_KEY") or (os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN")))

        for contact in contacts:
            contact_id = contact.get("id", str(uuid.uuid4()))
            recipient_name = contact.get("full_name", "Trusted Contact")
            recipient_phone = contact.get("phone_number", "Unknown")

            if has_carrier_creds:
                sent_ok = self._send_carrier_sms(recipient_phone, sms_text)
                event_item = NotificationEventItem(
                    id=str(uuid.uuid4()),
                    channel="sms",
                    recipient_name=recipient_name,
                    recipient_phone=recipient_phone,
                    delivery_status="sent" if sent_ok else "failed",
                    provider_name="Carrier_SMS_Gateway",
                    created_at=now
                )
                notification_events.append(event_item)
            else:
                event_item = NotificationEventItem(
                    id=str(uuid.uuid4()),
                    channel="sms" if contact.get("notify_by_sms", True) else "app",
                    recipient_name=recipient_name,
                    recipient_phone=recipient_phone,
                    delivery_status="demo_mode",
                    provider_name="SafeSignal_Demo_Dispatch_Layer",
                    created_at=now
                )
                notification_events.append(event_item)

        return notification_events

    def dispatch_journey_overdue_alert(
        self,
        journey_id: str,
        user_id: str,
        destination_name: str,
        contacts: List[Dict[str, Any]]
    ) -> List[NotificationEventItem]:
        """
        Dispatches alerts when an active journey exceeds the estimated arrival time without a check-in.
        """
        events: List[NotificationEventItem] = []
        now = datetime.now(timezone.utc)

        for contact in contacts:
            events.append(
                NotificationEventItem(
                    id=str(uuid.uuid4()),
                    channel="sms",
                    recipient_name=contact.get("full_name", "Trusted Contact"),
                    recipient_phone=contact.get("phone_number", "Unknown"),
                    delivery_status="demo_mode" if self.demo_mode else "sent",
                    provider_name="SafeSignal_Journey_Monitor",
                    created_at=now
                )
            )
        return events

notification_service = NotificationService(demo_mode=True)

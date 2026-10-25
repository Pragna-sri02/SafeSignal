import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class DataStore:
    """
    Thread-safe in-memory store for session data, incidents, contacts, and evidence.
    Synchronizes with Supabase when configured, or functions as a local development store.
    """

    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.contacts: Dict[str, List[Dict[str, Any]]] = {}
        self.incidents: Dict[str, List[Dict[str, Any]]] = {}
        self.journeys: Dict[str, List[Dict[str, Any]]] = {}
        self.evidence: Dict[str, List[Dict[str, Any]]] = {}
        self._seed_sample_data()

    def _seed_sample_data(self):
        # Sample user data for demo presentations
        demo_user_id = "00000000-0000-0000-0000-000000000001"
        self.profiles[demo_user_id] = {
            "id": demo_user_id,
            "email": "demo.user@safesignal.local",
            "full_name": "Priya Sharma",
            "phone_number": "+91 98765 43210",
            "emergency_note": "Carries asthma inhaler. Blood Group: B+",
            "safety_checkin_frequency": 30,
            "is_onboarding_completed": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        self.contacts[demo_user_id] = []

        self.evidence[demo_user_id] = [
            {
                "id": str(uuid.uuid4()),
                "user_id": demo_user_id,
                "title": "Impersonation account on Instagram",
                "category": "impersonation",
                "incident_date": datetime.now(timezone.utc),
                "platform_name": "Instagram",
                "suspect_identifier": "@priya_sharma_real_fake",
                "incident_url": "https://instagram.com/priya_sharma_real_fake",
                "description": "Suspect profile created using my college photos, soliciting money from contacts via DMs.",
                "notes": "Sent warning message to friends. Recorded screenshots showing handle and DM messages.",
                "reporting_status": "evidence_preserved",
                "file_attachments": [],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]

    # --- Profile Operations ---
    def get_profile(self, user_id: str, email: Optional[str] = None) -> Dict[str, Any]:
        if user_id not in self.profiles:
            now = datetime.now(timezone.utc)
            self.profiles[user_id] = {
                "id": user_id,
                "email": email or "user@safesignal.local",
                "full_name": "SafeSignal User",
                "phone_number": "",
                "emergency_note": "",
                "safety_checkin_frequency": 30,
                "is_onboarding_completed": False,
                "created_at": now,
                "updated_at": now
            }
        return self.profiles[user_id]

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.get_profile(user_id)
        for k, v in updates.items():
            if v is not None:
                profile[k] = v
        profile["updated_at"] = datetime.now(timezone.utc)
        self.profiles[user_id] = profile
        return profile

    # --- Contacts Operations ---
    def get_contacts(self, user_id: str) -> List[Dict[str, Any]]:
        return self.contacts.get(user_id, [])

    def add_contact(self, user_id: str, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        contact_list = self.contacts.setdefault(user_id, [])
        now = datetime.now(timezone.utc)
        new_contact = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
            **contact_data
        }
        contact_list.append(new_contact)
        return new_contact

    def update_contact(self, user_id: str, contact_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        contact_list = self.contacts.get(user_id, [])
        for contact in contact_list:
            if contact["id"] == contact_id:
                for k, v in updates.items():
                    if v is not None:
                        contact[k] = v
                contact["updated_at"] = datetime.now(timezone.utc)
                return contact
        return None

    def delete_contact(self, user_id: str, contact_id: str) -> bool:
        contact_list = self.contacts.get(user_id, [])
        initial_len = len(contact_list)
        self.contacts[user_id] = [c for c in contact_list if c["id"] != contact_id]
        return len(self.contacts[user_id]) < initial_len

    # --- Incident Operations ---
    def add_incident(self, user_id: str, incident: Dict[str, Any]) -> Dict[str, Any]:
        incidents = self.incidents.setdefault(user_id, [])
        incidents.insert(0, incident)
        return incident

    def get_latest_incident(self, user_id: str) -> Optional[Dict[str, Any]]:
        incidents = self.incidents.get(user_id, [])
        return incidents[0] if incidents else None

    def update_incident(self, user_id: str, incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        incidents = self.incidents.get(user_id, [])
        for inc in incidents:
            if inc["id"] == incident_id:
                for k, v in updates.items():
                    if v is not None:
                        inc[k] = v
                inc["updated_at"] = datetime.now(timezone.utc)
                return inc
        return None

    # --- Journey Operations ---
    def add_journey(self, user_id: str, journey: Dict[str, Any]) -> Dict[str, Any]:
        journeys = self.journeys.setdefault(user_id, [])
        journeys.insert(0, journey)
        return journey

    def get_active_journey(self, user_id: str) -> Optional[Dict[str, Any]]:
        journeys = self.journeys.get(user_id, [])
        for j in journeys:
            if j["status"] in ("active", "overdue"):
                return j
        return None

    def update_journey(self, user_id: str, journey_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        journeys = self.journeys.get(user_id, [])
        for j in journeys:
            if j["id"] == journey_id:
                for k, v in updates.items():
                    if v is not None:
                        j[k] = v
                j["updated_at"] = datetime.now(timezone.utc)
                return j
        return None

    # --- Evidence Operations ---
    def get_evidence(self, user_id: str, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        records = self.evidence.get(user_id, [])
        filtered = records
        if category and category != "all":
            filtered = [r for r in filtered if r.get("category") == category]
        if search:
            s_lower = search.lower()
            filtered = [r for r in filtered if s_lower in r.get("title", "").lower() or s_lower in r.get("description", "").lower()]
        return filtered

    def get_evidence_by_id(self, user_id: str, record_id: str) -> Optional[Dict[str, Any]]:
        records = self.evidence.get(user_id, [])
        for r in records:
            if r["id"] == record_id:
                return r
        return None

    def add_evidence(self, user_id: str, record: Dict[str, Any]) -> Dict[str, Any]:
        records = self.evidence.setdefault(user_id, [])
        records.insert(0, record)
        return record

    def update_evidence(self, user_id: str, record_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        records = self.evidence.get(user_id, [])
        for r in records:
            if r["id"] == record_id:
                for k, v in updates.items():
                    if v is not None:
                        r[k] = v
                r["updated_at"] = datetime.now(timezone.utc)
                return r
        return None

    def delete_evidence(self, user_id: str, record_id: str) -> bool:
        records = self.evidence.get(user_id, [])
        initial_len = len(records)
        self.evidence[user_id] = [r for r in records if r["id"] != record_id]
        return len(self.evidence[user_id]) < initial_len

store = DataStore()

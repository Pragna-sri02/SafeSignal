import unittest
import sys
import os
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "app"))

from rag.retriever import safety_retriever
from app.services.notification_service import notification_service
from app.services.gemini_service import gemini_assistant
from app.services.store_service import store
from app.services.safety_service import get_digital_safety_categories, get_help_directory_resources

class TestSafeSignalCore(unittest.TestCase):

    def test_01_knowledge_base_chunks(self):
        """Test RAG knowledge base loaded the expected official chunks."""
        self.assertGreater(len(safety_retriever.chunks), 0)
        print(f"PASS: RAG Knowledge base loaded with {len(safety_retriever.chunks)} verified chunks.")

    def test_02_hacked_account_retrieval(self):
        """Test retrieval of hacked account recovery documents."""
        results = safety_retriever.retrieve("How do I recover my hacked Instagram account?", top_k=2)
        self.assertGreater(len(results), 0)
        self.assertIn("instagram.com/hacked", results[0]["source_url"])
        print("PASS: Verified recovery URL retrieved for hacked account query.")

    def test_03_cybercrime_india_retrieval(self):
        """Test retrieval of National Cyber Crime Reporting Portal."""
        results = safety_retriever.retrieve("Where can I report cyber harassment in India?", top_k=2)
        self.assertGreater(len(results), 0)
        urls = [r["source_url"] for r in results]
        self.assertTrue(any("cybercrime.gov.in" in u for u in urls))
        print("PASS: Official cybercrime.gov.in portal retrieved.")

    def test_04_emergency_keyword_detection(self):
        """Test detection of immediate physical safety threats."""
        self.assertTrue(gemini_assistant.is_immediate_physical_threat("Help me someone is following me right now"))
        self.assertTrue(gemini_assistant.is_immediate_physical_threat("I am in immediate danger right now"))
        self.assertFalse(gemini_assistant.is_immediate_physical_threat("What are the settings for two factor authentication?"))
        print("PASS: Urgent physical danger detector works accurately.")

    def test_05_notification_demo_mode_truthfulness(self):
        """Ensure demo mode status is strictly truthful and never fakes live carrier delivery."""
        contacts = [{"id": "c1", "full_name": "Mom", "phone_number": "+919876543210"}]
        events = notification_service.dispatch_sos_alerts("inc-1", "user-1", contacts)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].delivery_status, "demo_mode")
        self.assertEqual(events[0].provider_name, "SafeSignal_Demo_Dispatch_Layer")
        print("PASS: Truthful alert status reporting verified (demo_mode).")

    def test_06_digital_safety_categories_catalog(self):
        """Verify all 8 digital protection workflows are present."""
        cats = get_digital_safety_categories()
        self.assertEqual(len(cats), 8)
        expected_ids = {
            "hacked_account", "cyberbullying", "impersonation", "deepfake",
            "threats_blackmail", "privacy_breach", "suspicious_activity", "image_misuse"
        }
        actual_ids = {c.id for c in cats}
        self.assertEqual(expected_ids, actual_ids)
        print("PASS: All 8 digital protection playbooks present and validated.")

    def test_07_help_directory_india_resources(self):
        """Verify essential India helplines: 112, 181, 1930."""
        res = get_help_directory_resources()
        phones = [r.phone_number for r in res if r.phone_number]
        self.assertIn("112", phones)
        self.assertIn("181", phones)
        self.assertIn("1930", phones)
        print("PASS: Verified emergency numbers 112, 181, 1930 present.")

    def test_08_evidence_store_crud(self):
        """Test creating, fetching, and deleting evidence records."""
        user_id = "test-user-unit"
        record = {
            "id": "rec-123",
            "user_id": user_id,
            "title": "Online Harassment on X",
            "category": "cyberbullying",
            "description": "Received abusive direct messages from anonymous handle.",
            "reporting_status": "evidence_preserved"
        }
        store.add_evidence(user_id, record)
        fetched = store.get_evidence(user_id)
        self.assertEqual(len(fetched), 1)
        self.assertEqual(fetched[0]["title"], "Online Harassment on X")
        deleted = store.delete_evidence(user_id, "rec-123")
        self.assertTrue(deleted)
        self.assertEqual(len(store.get_evidence(user_id)), 0)
        print("PASS: Evidence vault CRUD operations validated.")

if __name__ == "__main__":
    unittest.main()

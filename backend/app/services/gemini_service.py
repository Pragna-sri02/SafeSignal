import os
import re
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.schemas import SourceCitationModel, AssistantChatResponse
from app.services.rag_service import rag_service

URGENT_KEYWORDS = [
    "help me", "someone is following me", "stalking me right now", "outside my door",
    "physically threatened", "attacked", "kidnap", "emergency", "danger right now",
    "in danger", "he has a weapon", "unsafe right now"
]

SYSTEM_PROMPT = """You are SafeSignal AI, a specialized women's safety and digital security advisor.
Your mission is to provide calm, reassuring, highly actionable, step-by-step guidance grounded strictly in trusted safety frameworks.

CRITICAL INSTRUCTIONS:
1. Grounding: Rely primarily on the provided [Retrieved Sources]. Do not fabricate legal provisions, contact phone numbers, or government procedures.
2. Tone: Calm, empathetic, non-judgmental, and practical. NEVER use victim-blaming language.
3. Physical Danger Priority: If the user indicates immediate physical danger or being followed, prioritize calling Emergency 112 or Women Helpline 181 immediately. Do NOT delay urgent action with unnecessary questions.
4. No False Promises: Never promise guaranteed account recovery, guaranteed perpetrator identification, or legal victory.
5. Privacy & Security: NEVER ask the user for passwords, OTPs, recovery backup codes, or financial PINs.
6. Format: Use clear numbered steps, bullet points, and highlight official portals.
"""

class GeminiSafetyAssistant:
    """
    Assistant service utilizing the official google-genai SDK with RAG grounding.
    Includes a resilient, grounded fallback when GEMINI_API_KEY is not configured.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[GeminiAssistant] Initialized google-genai client with model: {self.model_name}")
            except Exception as e:
                print(f"[GeminiAssistant] Could not initialize google-genai SDK: {e}")

    def is_immediate_physical_threat(self, message: str) -> bool:
        msg_lower = message.lower()
        return any(kw in msg_lower for kw in URGENT_KEYWORDS)

    async def generate_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> AssistantChatResponse:
        is_urgent = self.is_immediate_physical_threat(user_message)

        # 1. Retrieve trusted documents
        context_str, citations = rag_service.retrieve_context_and_citations(user_message, top_k=3)

        # 2. If immediate physical threat detected, prepend emergency guidance banner
        emergency_prefix = ""
        suggested_actions = []

        if is_urgent:
            emergency_prefix = (
                "🚨 **URGENT SAFETY ALERT**: If you are in immediate physical danger, please call **112 (India All-in-One Emergency)** right now, or activate the SOS button on your SafeSignal dashboard.\n\n"
            )
            suggested_actions.extend(["Call 112 Immediately", "Activate Emergency SOS", "Move to a Well-Lit Public Space"])

        # 3. Call Gemini if client is ready
        if self.client and self.api_key:
            try:
                prompt_content = f"""{SYSTEM_PROMPT}

[Retrieved Sources]:
{context_str if context_str else "No specific documents retrieved. Use established official standard safety practices."}

[User Query]:
{user_message}

Provide a structured, step-by-step guidance response:"""

                # Call official google-genai SDK
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt_content,
                )

                answer_text = emergency_prefix + (response.text or "I am here to help you stay safe. Please review the recommended steps below.")

                # Populate dynamic suggested actions based on context
                if not suggested_actions:
                    suggested_actions = self._generate_suggested_actions(user_message, citations)

                return AssistantChatResponse(
                    answer=answer_text,
                    citations=citations,
                    is_urgent=is_urgent,
                    emergency_options_provided=is_urgent,
                    generated_by="google-genai",
                    suggested_actions=suggested_actions
                )
            except Exception as e:
                print(f"[GeminiAssistant] API error: {e}. Falling back to grounded retrieval template.")

        # 4. Fallback Generator (Grounded in RAG documents)
        fallback_answer = self._generate_grounded_fallback(user_message, citations, context_str, emergency_prefix)
        if not suggested_actions:
            suggested_actions = self._generate_suggested_actions(user_message, citations)

        return AssistantChatResponse(
            answer=fallback_answer,
            citations=citations,
            is_urgent=is_urgent,
            emergency_options_provided=is_urgent,
            generated_by="rag-grounded-fallback",
            suggested_actions=suggested_actions
        )

    def _generate_grounded_fallback(
        self,
        query: str,
        citations: List[SourceCitationModel],
        context_str: str,
        emergency_prefix: str
    ) -> str:
        """
        Produces clean, grounded safety advice from verified documents when API key is not present.
        """
        q_lower = query.lower()

        if "hack" in q_lower or "compromised" in q_lower or "password" in q_lower:
            return (
                f"{emergency_prefix}Here is the verified response protocol for compromised accounts:\n\n"
                "1. **Use Official Recovery Channels**:\n"
                "   - For Instagram: Navigate directly to [https://www.instagram.com/hacked](https://www.instagram.com/hacked) from your phone or familiar browser.\n"
                "   - For Google / Gmail: Go to [https://accounts.google.com/signin/recovery](https://accounts.google.com/signin/recovery).\n\n"
                "2. **Check Security Notifications**:\n"
                "   - Search your inbox for emails from `security@mail.instagram.com`. Look for a 'Revert this change' link if your email was modified.\n\n"
                "3. **Submit Identity Verification**:\n"
                "   - Use the **Video Selfie Verification** option within the app if your account has photos of you.\n\n"
                "4. **Log Out Suspicious Sessions**:\n"
                "   - Terminate all active sessions and enable App-based 2-Factor Authentication (Authenticator app, not SMS).\n\n"
                "⚠️ *Warning: Never pay third-party 'recovery experts' in DMs. Never disclose OTPs or backup codes.*"
            )

        if "fake" in q_lower or "impersonat" in q_lower or "photos" in q_lower or "profile" in q_lower:
            return (
                f"{emergency_prefix}If someone created a fake profile using your photos or identity:\n\n"
                "1. **Do Not Engage with the Imposter**: Avoid DMing the fake account directly.\n\n"
                "2. **Copy Permanent Profile URL**: Obtain the exact link from a browser (e.g. `instagram.com/username`).\n\n"
                "3. **Submit Official Impersonation Form**:\n"
                "   - Use the platform's dedicated impersonation form which allows submitting government photo ID to prove you are the real person.\n\n"
                "4. **Report on National Cyber Crime Portal**:\n"
                "   - File an official complaint at [https://cybercrime.gov.in](https://cybercrime.gov.in) under *Report Crime Related to Women/Children* (under Section 66D IT Act for cheating by personation).\n\n"
                "5. **Preserve Screenshots**: Store full screenshots in your SafeSignal Evidence Organizer before the account is deleted."
            )

        if "evidence" in q_lower or "preserve" in q_lower or "threat" in q_lower:
            return (
                f"{emergency_prefix}Standard Forensic Guidance for Preserving Digital Evidence:\n\n"
                "1. **Capture Full-Screen Uncropped Images**:\n"
                "   - Ensure the suspect's handle, date, exact timestamp, and web address bar (URL) are clearly visible.\n"
                "   - Do not crop into isolated chat bubbles.\n\n"
                "2. **Record Continuous Video Scroll**:\n"
                "   - For lengthy chat threads, capture a continuous screen video showing the scroll from start to finish.\n\n"
                "3. **Preserve Email RFC Headers**:\n"
                "   - Download the original `.eml` file containing originating IP address and mail routing headers.\n\n"
                "4. **Save Financial Reference Details**:\n"
                "   - For extortion or blackmail, save UPI IDs, bank account names, and phone numbers.\n\n"
                "5. **Use the SafeSignal Evidence Organizer**:\n"
                "   - Record the incident with timestamps and generate a structured incident report for law enforcement."
            )

        if "journey" in q_lower or "travel" in q_lower or "cab" in q_lower or "car" in q_lower:
            return (
                f"{emergency_prefix}Safe Travel & Journey Precautions:\n\n"
                "1. **Pre-Trip Verification**:\n"
                "   - Verify vehicle license plate number, driver photo, and make sure child locks are not engaged.\n\n"
                "2. **Activate SafeSignal Journey Safety**:\n"
                "   - Set your destination and expected arrival time. If check-in is missed, configured trusted contacts will be alerted.\n\n"
                "3. **If You Feel Unsafe During Transit**:\n"
                "   - Firmly ask the driver to stop near a well-lit public space, petrol pump, or metro station.\n"
                "   - Dial **112 (Emergency Police)** immediately.\n"
                "   - Use the SafeSignal SOS button to transmit your live coordinates to trusted contacts."
            )

        # General response with retrieved citation details
        first_citation = citations[0] if citations else None
        source_note = f"\n\n*Reference: {first_citation.title} ({first_citation.source_url})*" if first_citation else ""

        return (
            f"{emergency_prefix}Based on trusted safety guidelines:\n\n"
            "1. **Assess Immediate Safety**: If there is any risk of physical harm, dial **112** (Police Emergency) or **181** (Women Helpline) immediately.\n"
            "2. **For Online Incidents**: File a report with the **National Cyber Crime Reporting Portal** at [https://cybercrime.gov.in](https://cybercrime.gov.in) or call Helpline **1930**.\n"
            "3. **Preserve Documentation**: Save complete, uncropped screenshots and profile URLs before blocking offenders.\n"
            "4. **Secure Your Accounts**: Terminate unknown device sessions, change primary passwords, and turn on app-based two-factor authentication."
            f"{source_note}"
        )

    def _generate_suggested_actions(self, message: str, citations: List[SourceCitationModel]) -> List[str]:
        msg = message.lower()
        if "hack" in msg or "account" in msg:
            return ["Open Instagram Hacked Portal", "Check Security Emails", "Add Evidence Record"]
        elif "fake" in msg or "impersonat" in msg:
            return ["Submit Meta Impersonation Form", "File cybercrime.gov.in Report", "Save Profile Screenshots"]
        elif "threat" in msg or "blackmail" in msg:
            return ["Call 1930 Cyber Helpline", "Cease Communication with Extortionist", "Preserve Evidence in Vault"]
        elif "journey" in msg or "trip" in msg or "travel" in msg:
            return ["Start Journey Check-in", "Share Location with Contacts", "Dial 112 Emergency"]
        return ["Report on Cybercrime Portal", "Save to Evidence Organizer", "View Trusted Help Directory"]

gemini_assistant = GeminiSafetyAssistant()

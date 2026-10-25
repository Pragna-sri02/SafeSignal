from typing import List, Dict, Any
from app.models.schemas import DigitalCategoryGuidance, DigitalChecklistItem, HelpResourceItem

DIGITAL_SAFETY_CATEGORIES: List[DigitalCategoryGuidance] = [
    DigitalCategoryGuidance(
        id="hacked_account",
        title="Hacked or Compromised Social Media Account",
        summary="Actionable steps to regain access to social platforms, invalidate unauthorized sessions, and secure linked recovery emails.",
        immediate_considerations=[
            "Do not pay any third-party 'ethical hacker' or 'account recovery specialist' on Instagram/X; they are secondary scammers.",
            "Never disclose OTPs, SMS codes, or authenticator backup keys to anyone claiming to be customer support.",
            "Verify whether linked email and phone numbers have been altered before attempting automated recovery."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="hk_1",
                title="Use Official Account Recovery Portals Only",
                detail="Navigate directly to https://instagram.com/hacked or https://accounts.google.com/signin/recovery from a familiar browser/device."
            ),
            DigitalChecklistItem(
                id="hk_2",
                title="Check for Official Security Emails",
                detail="Search your email inbox for messages from security@mail.instagram.com or no-reply@accounts.google.com. Click 'Revert this change' if your email address was altered."
            ),
            DigitalChecklistItem(
                id="hk_3",
                title="Request Video Selfie Verification",
                detail="On Instagram, if your profile contains your photos, use the 'Need more help?' option to submit a video selfie proving your identity."
            ),
            DigitalChecklistItem(
                id="hk_4",
                title="Log Out All Unauthorized Sessions",
                detail="Once you regain partial or full access, immediately choose 'Log out of all other devices' and revoke third-party app permissions."
            ),
            DigitalChecklistItem(
                id="hk_5",
                title="Enable App-Based Two-Factor Authentication",
                detail="Configure an authenticator app (e.g. Google Authenticator) instead of SMS-based 2FA to prevent SIM-swap attacks."
            )
        ],
        security_privacy_actions=[
            "Change your primary email password immediately, using a unique passphrase of at least 16 characters.",
            "Review Google / Apple connected apps and revoke permissions for unknown third-party services.",
            "Update security questions and ensure backup recovery codes are stored offline securely."
        ],
        evidence_preservation_tips=[
            "Screenshot login attempt alerts showing unusual IP addresses, device types, or foreign cities.",
            "Save original notification emails as .eml or unedited screenshot with full email headers.",
            "Log the incident in the SafeSignal Evidence Organizer with timestamps."
        ],
        official_reporting_links=[
            {"name": "Instagram Hacked Recovery", "url": "https://www.instagram.com/hacked"},
            {"name": "Meta/Facebook Hacked Assistance", "url": "https://www.facebook.com/hacked"},
            {"name": "Google Account Recovery", "url": "https://accounts.google.com/signin/recovery"},
            {"name": "WhatsApp Account Takeover Guide", "url": "https://faq.whatsapp.com/1131652977717250"}
        ],
        statutory_legal_references=[
            "Section 66 Information Technology Act, 2000 (Computer related offences)",
            "Section 66C IT Act (Punishment for identity theft - imprisonment up to 3 years)"
        ]
    ),
    DigitalCategoryGuidance(
        id="cyberbullying",
        title="Cyberbullying, Online Harassment & Stalking",
        summary="Protective measures to stop persistent harassment, silence aggressors, document evidence, and seek legal protection under Indian law.",
        immediate_considerations=[
            "If the harasser indicates imminent physical violence or reveals your real-time physical location, call 112 immediately.",
            "Avoid angry replies or counter-threats. Harassers thrive on reactions, and hostile replies may complicate legal complaints.",
            "Preserve evidence first before blocking the perpetrator."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="cb_1",
                title="Capture Comprehensive Uncropped Screenshots",
                detail="Take screenshots showing the perpetrator's exact username, profile URL, message text, and device timestamp."
            ),
            DigitalChecklistItem(
                id="cb_2",
                title="Restrict or Mute Before Blocking",
                detail="Use 'Restrict' mode on Instagram/Facebook so their comments are hidden from the public while you collect proof."
            ),
            DigitalChecklistItem(
                id="cb_3",
                title="Set Social Accounts to Private",
                detail="Switch accounts to private, disable message requests from unknown accounts, and limit comments to close friends."
            ),
            DigitalChecklistItem(
                id="cb_4",
                title="Block and Report Profile",
                detail="Use in-app report buttons under 'Harassment or Bullying'. Keep a record of the report confirmation number."
            ),
            DigitalChecklistItem(
                id="cb_5",
                title="Lodge Online Cybercrime Complaint",
                detail="Submit a complaint at https://cybercrime.gov.in under 'Report Cyber Crime Against Women/Children'."
            )
        ],
        security_privacy_actions=[
            "Disable location tagging on future and past social media posts.",
            "Audit your followers list and remove unfamiliar or suspicious anonymous accounts.",
            "Google your name and phone number to check if personal information has been doxxed on public forums."
        ],
        evidence_preservation_tips=[
            "Record exact profile URLs rather than just display names which can be changed at will.",
            "For audio notes or video threats, save raw files to a secure storage drive without altering metadata.",
            "Record a screen video of the chat thread scrolling to establish unedited continuity."
        ],
        official_reporting_links=[
            {"name": "National Cyber Crime Reporting Portal", "url": "https://cybercrime.gov.in"},
            {"name": "Instagram Harassment Reporting", "url": "https://help.instagram.com/547601325292351"},
            {"name": "X (Twitter) Safety & Harassment Center", "url": "https://help.twitter.com/en/safety-and-security"}
        ],
        statutory_legal_references=[
            "Section 354D Indian Penal Code (IPC) - Cyberstalking (Punishable with up to 3 years imprisonment)",
            "Section 509 IPC - Word, gesture or act intended to insult modesty of a woman",
            "Section 67 IT Act - Transmitting obscene material electronically"
        ]
    ),
    DigitalCategoryGuidance(
        id="impersonation",
        title="Impersonation & Fake Profiles",
        summary="How to report fraudulent profiles using your name, photos, or personal details to deceive contacts and harm reputation.",
        immediate_considerations=[
            "Do not engage directly with the imposter account; direct messages may provoke malicious retaliation.",
            "Alert close friends and family on a trusted platform not to accept friend requests or send money to the fake account.",
            "Submit the official impersonation form requiring government ID to expedite account removal."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="imp_1",
                title="Locate the Permanent Account URL",
                detail="Copy the full URL of the fake account profile from a browser to capture its unique handle and platform ID."
            ),
            DigitalChecklistItem(
                id="imp_2",
                title="Submit Official Impersonation Form",
                detail="Use platform-specific forms (e.g. Meta Impersonation Form) which allow you to submit government photo ID proving you are the real person."
            ),
            DigitalChecklistItem(
                id="imp_3",
                title="Coordinate Reporting with Trusted Friends",
                detail="Ask trusted friends to report the account for 'Pretending to be someone I know' and select your authentic profile."
            ),
            DigitalChecklistItem(
                id="imp_4",
                title="Register Incident in SafeSignal Evidence Vault",
                detail="Save profile screenshots and links so you have a documented record for law enforcement if needed."
            )
        ],
        security_privacy_actions=[
            "Switch your authentic profile's visibility to private to prevent further scraping of your personal photos.",
            "Watermark future public photos with subtle initials or copyright markers.",
            "Turn on profile picture protection where supported (e.g. Facebook Profile Picture Guard)."
        ],
        evidence_preservation_tips=[
            "Screenshot the fake bio, profile picture, follower count, and any fraudulent DMs sent to friends.",
            "Capture screenshots from friends who were contacted or solicited for money by the imposter."
        ],
        official_reporting_links=[
            {"name": "Instagram Impersonation Form", "url": "https://help.instagram.com/contact/636276399721841"},
            {"name": "Facebook Impersonation Report", "url": "https://www.facebook.com/help/contact/295309487309948"},
            {"name": "National Cyber Crime Portal", "url": "https://cybercrime.gov.in"}
        ],
        statutory_legal_references=[
            "Section 66D IT Act - Cheating by personation by using computer resource (up to 3 years imprisonment)",
            "Section 419 Indian Penal Code - Punishment for cheating by personation"
        ]
    ),
    DigitalCategoryGuidance(
        id="deepfake",
        title="Deepfakes & Image Morphing Incidents",
        summary="Emergency response procedures for AI-generated deepfakes, face-swapping, and morphed imagery targeting women.",
        immediate_considerations=[
            "Remember: You are the victim of a malicious criminal offense. Do not blame yourself or surrender to shame.",
            "Never pay ransom or extortion demands. Paying guarantees continued extortion and larger financial demands.",
            "Under Indian IT Rules 2021, platforms are legally mandated to take down non-consensual sexually explicit content within 24 hours of reporting."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="df_1",
                title="Document Evidence Securely",
                detail="Screenshot the offending post, web URLs, extortion messages, and any payment identifiers (UPI, bank, crypto wallet)."
            ),
            DigitalChecklistItem(
                id="df_2",
                title="Use StopNCII.org Hash-Generation",
                detail="Open https://stopncii.org. It generates digital image hashes on your device to block re-upload across Meta, TikTok, OnlyFans without uploading your actual photos."
            ),
            DigitalChecklistItem(
                id="df_3",
                title="Report to Platform Grievance Officer",
                detail="Submit a complaint to the platform's Resident Grievance Officer in India citing Rule 3(2)(b) of the IT Rules 2021 demanding 24-hour takedown."
            ),
            DigitalChecklistItem(
                id="df_4",
                title="File Urgent Complaint on cybercrime.gov.in",
                detail="Report under 'Report Crime Related to Women/Children' -> 'Sexually Obscene / Morphing'. Can be filed anonymously if preferred."
            )
        ],
        security_privacy_actions=[
            "Lock social media accounts and disable high-resolution photo downloads.",
            "Review Google Images / reverse-image search to identify if images have been mirrored on external hosting sites."
        ],
        evidence_preservation_tips=[
            "Do not crop the web browser URL bar or date/time when capturing screenshots.",
            "Save direct CDN links or web page archives using web archiving tools."
        ],
        official_reporting_links=[
            {"name": "StopNCII.org (Non-Consensual Image Prevention)", "url": "https://stopncii.org"},
            {"name": "Take It Down (Under 18 Protection)", "url": "https://takeitdown.ncmec.org"},
            {"name": "National Cyber Crime Reporting Portal", "url": "https://cybercrime.gov.in"}
        ],
        statutory_legal_references=[
            "Section 66E IT Act - Violation of privacy (up to 3 years imprisonment)",
            "Section 67 & 67A IT Act - Publishing sexually explicit material in electronic form (up to 5 years)",
            "Rule 3(2)(b) Information Technology (Intermediary Guidelines) Rules, 2021"
        ]
    ),
    DigitalCategoryGuidance(
        id="threats_blackmail",
        title="Threats, Extortion & Sextortion Blackmail",
        summary="Strategic crisis playbook for managing online extortion, sextortion traps, and direct threats of violence or exposure.",
        immediate_considerations=[
            "If in immediate physical danger, dial 112 immediately.",
            "DO NOT PAY. Payments never delete the blackmailer's files; they mark you as a paying target and escalate demands.",
            "Cut off direct conversation, but DO NOT delete the chat or block them before screenshots are saved."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="tb_1",
                title="Cease Direct Communication",
                detail="Do not negotiate, plead, or send counter-threats. Stop answering incoming calls or chats."
            ),
            DigitalChecklistItem(
                id="tb_2",
                title="Preserve Unedited Chat Transcripts",
                detail="Take full-screen captures showing extortion demands, timestamps, account handles, phone numbers, and payment details."
            ),
            DigitalChecklistItem(
                id="tb_3",
                title="Call 1930 for Financial Extortion",
                detail="If money was already transferred under duress, dial 1930 immediately to freeze transactions in banking channels."
            ),
            DigitalChecklistItem(
                id="tb_4",
                title="Report to Law Enforcement",
                detail="File a report at cybercrime.gov.in and reach out to local Cyber Police Station or Women's Help Desk."
            )
        ],
        security_privacy_actions=[
            "Change passwords across email and social media from a trusted secondary device.",
            "Deactivate social accounts temporarily if the blackmailer threatens to message followers."
        ],
        evidence_preservation_tips=[
            "Preserve UPI IDs, QR codes, bank account names, and phone numbers provided by the extortionist.",
            "Store all evidence files in your SafeSignal Evidence Vault."
        ],
        official_reporting_links=[
            {"name": "Cybercrime Helpline 1930", "url": "https://cybercrime.gov.in"},
            {"name": "National Cyber Crime Portal", "url": "https://cybercrime.gov.in"}
        ],
        statutory_legal_references=[
            "Section 384 IPC - Punishment for extortion (up to 3 years imprisonment)",
            "Section 506 IPC - Criminal intimidation",
            "Section 67A IT Act - Transmitting sexually explicit content"
        ]
    ),
    DigitalCategoryGuidance(
        id="privacy_breach",
        title="Privacy Breaches & Unwanted Tracking",
        summary="Steps to detect spyware, stalkerware, unauthorized location tracking, and compromised cloud accounts.",
        immediate_considerations=[
            "If someone knows your real-time physical movements, assume device or cloud location sharing is compromised.",
            "Do not inspect spyware on the compromised device in front of a suspicious partner or perpetrator.",
            "Use a secure secondary device (e.g. library, office, or trusted friend's phone) to change critical passwords."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="pb_1",
                title="Audit Active Device Sessions",
                detail="Check Google Account -> Devices, Apple ID -> Devices, and WhatsApp -> Linked Devices for unrecognized sessions."
            ),
            DigitalChecklistItem(
                id="pb_2",
                title="Review Location Sharing Services",
                detail="Check Google Maps Location Sharing, Apple Find My, and Life360 to see if your real-time location is shared."
            ),
            DigitalChecklistItem(
                id="pb_3",
                title="Check App Permissions",
                detail="Review apps with Location, Camera, and Microphone permissions. Revoke permissions for unknown or sideloaded apps."
            ),
            DigitalChecklistItem(
                id="pb_4",
                title="Perform Anti-Malware Scan",
                detail="Run a reputable mobile security scan or perform a clean factory reset if stalkerware is suspected."
            )
        ],
        security_privacy_actions=[
            "Disable Bluetooth and Wi-Fi scanning when traveling through crowded transit hubs.",
            "Use hardware 2FA keys or authenticator apps rather than SMS verification."
        ],
        evidence_preservation_tips=[
            "Screenshot list of active sessions, logged IP addresses, and authorized device names.",
            "Note the names of suspicious apps installed without your consent."
        ],
        official_reporting_links=[
            {"name": "Google Device Activity", "url": "https://myaccount.google.com/device-activity"},
            {"name": "Apple Security & Privacy Guide", "url": "https://support.apple.com/guide/personal-safety"}
        ],
        statutory_legal_references=[
            "Section 66E IT Act - Violation of privacy",
            "Digital Personal Data Protection Act, 2023"
        ]
    ),
    DigitalCategoryGuidance(
        id="suspicious_activity",
        title="Suspicious Account Activity & Phishing Alerts",
        summary="Identify phishing traps, credential harvesting links, and unusual login warnings before accounts are taken over.",
        immediate_considerations=[
            "Never click password-reset links inside unsolicited emails or SMS messages.",
            "Verify the exact domain URL before entering credentials (e.g. avoid rneta.com or instagran-support.net).",
            "If you entered your password on a suspicious site, change it immediately on the legitimate platform."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="sa_1",
                title="Inspect Sender Address Carefully",
                detail="Look beyond the display name; check if the actual sender domain matches the official platform."
            ),
            DigitalChecklistItem(
                id="sa_2",
                title="Change Compromised Credentials",
                detail="If passwords were submitted to a suspicious page, update them immediately and terminate all sessions."
            ),
            DigitalChecklistItem(
                id="sa_3",
                title="Forward Phishing Reports",
                detail="Report phishing emails to reportphishing@apwg.org and in-app reporting filters."
            )
        ],
        security_privacy_actions=[
            "Enable passkeys or biometric authentication for faster, phishing-resistant logins.",
            "Store passwords in an encrypted password manager rather than browser autofill."
        ],
        evidence_preservation_tips=[
            "Save the complete URL of the phishing webpage.",
            "Export the phishing email with full routing headers."
        ],
        official_reporting_links=[
            {"name": "CERT-In Cyber Incident Reporting", "url": "https://www.cert-in.org.in"},
            {"name": "Anti-Phishing Working Group", "url": "https://apwg.org"}
        ],
        statutory_legal_references=[
            "Section 66D IT Act - Cheating by impersonation"
        ]
    ),
    DigitalCategoryGuidance(
        id="image_misuse",
        title="Misuse of Personal Images & Non-Consensual Sharing",
        summary="Comprehensive protocol to remove unauthorized photographs, intimate images, or doxxed pictures from public view.",
        immediate_considerations=[
            "You are protected under Indian law; non-consensual sharing of intimate images is a non-bailable offense.",
            "Act quickly to stop syndication across secondary websites.",
            "Seek psychological and emotional support from certified helplines like iCall (9152987821)."
        ],
        response_checklist=[
            DigitalChecklistItem(
                id="im_1",
                title="Submit Copyright / DMCA Takedown",
                detail="If you own the copyright of the photo, file a DMCA or platform privacy takedown notice."
            ),
            DigitalChecklistItem(
                id="im_2",
                title="Submit StopNCII Case",
                detail="Create a protection case at StopNCII.org to prevent publication across participating tech platforms."
            ),
            DigitalChecklistItem(
                id="im_3",
                title="Lodge Police FIR on cybercrime.gov.in",
                detail="File a formal complaint under the Women/Child category on the National Cyber Crime Portal."
            )
        ],
        security_privacy_actions=[
            "Audit cloud photo backup settings (Google Photos, iCloud) to ensure albums are not publicly shared.",
            "Set social media profiles to private."
        ],
        evidence_preservation_tips=[
            "Capture screenshots showing timestamp, platform URL, and post engagement count.",
            "Record exact user profile links distributing the content."
        ],
        official_reporting_links=[
            {"name": "StopNCII.org", "url": "https://stopncii.org"},
            {"name": "Cybercrime.gov.in Women Section", "url": "https://cybercrime.gov.in"},
            {"name": "Google Remove Personal Content Form", "url": "https://support.google.com/websearch/troubleshooter/3111061"}
        ],
        statutory_legal_references=[
            "Section 67A IT Act - Publishing or transmitting sexually explicit act in electronic form (up to 5 years imprisonment)",
            "Section 354C IPC - Voyeurism"
        ]
    )
]

HELP_DIRECTORY_RESOURCES: List[HelpResourceItem] = [
    HelpResourceItem(
        id="erss_112",
        name="Emergency Response Support System (ERSS 112)",
        purpose="Pan-India single emergency number for immediate police, fire, and ambulance dispatch in life-threatening situations.",
        phone_number="112",
        website_url="https://112.gov.in",
        category="emergency_police",
        operating_hours="24/7 (365 days)",
        coverage_area="Pan-India (All States & UTs)",
        usage_instructions="Dial directly from any mobile or landline phone without area code. Works even when phone is locked or SIM has zero balance.",
        is_emergency=True
    ),
    HelpResourceItem(
        id="women_helpline_181",
        name="Women Helpline (181)",
        purpose="24/7 toll-free helpline providing crisis intervention, police assistance, counseling, shelter referral, and medical aid under Nirbhaya Fund.",
        phone_number="181",
        website_url="https://wcd.nic.in",
        category="women_helpline",
        operating_hours="24/7",
        coverage_area="Pan-India (State Command Centers)",
        usage_instructions="Toll-free voice call. Connects to state-specific women support centers, One Stop Sakhi Centres, and legal aid counselors.",
        is_emergency=True
    ),
    HelpResourceItem(
        id="cybercrime_portal",
        name="National Cyber Crime Reporting Portal",
        purpose="Official Government of India portal for filing cybercrime complaints, with dedicated anonymous and tracked reporting for women.",
        phone_number="1930",
        website_url="https://cybercrime.gov.in",
        category="cybercrime",
        operating_hours="Online 24/7 (1930 Helpline: 24/7)",
        coverage_area="Pan-India",
        usage_instructions="Dial 1930 for financial cyber fraud. For online harassment, deepfakes, or extortion, visit cybercrime.gov.in and click 'Report Crime Related to Women/Children'.",
        is_emergency=False
    ),
    HelpResourceItem(
        id="ncw_helpline",
        name="National Commission for Women (NCW) 24/7 Helpline",
        purpose="Specialized helpline to provide counseling and referral support for women facing violence, domestic abuse, or cyber harassment.",
        phone_number="7827170170",
        website_url="http://ncw.nic.in",
        category="women_helpline",
        operating_hours="24/7",
        coverage_area="National (India)",
        usage_instructions="Call for psychological support, guidance on legal proceedings, and escalating unresolved police matters.",
        is_emergency=False
    ),
    HelpResourceItem(
        id="icall_tiss",
        name="iCALL Psychosocial Helpline (TISS)",
        purpose="Confidential mental health counseling and psychological first aid provided by trained professionals at Tata Institute of Social Sciences.",
        phone_number="9152987821",
        website_url="https://icallhelpline.org",
        category="mental_health",
        operating_hours="Monday - Saturday: 10:00 AM to 8:00 PM",
        coverage_area="National (India)",
        usage_instructions="Call or email icall@tiss.edu for compassionate, trauma-informed psychosocial counseling for survivors of cyber or physical violence.",
        is_emergency=False
    ),
    HelpResourceItem(
        id="stopncii",
        name="StopNCII.org (Non-Consensual Image Tool)",
        purpose="Free privacy-preserving tool that creates cryptographic hashes of intimate images to block them across Meta, TikTok, OnlyFans, Bumble.",
        phone_number=None,
        website_url="https://stopncii.org",
        category="digital_protection",
        operating_hours="24/7 Online",
        coverage_area="Global / Available in India",
        usage_instructions="Your photo never leaves your device. A cryptographic hash is generated locally and shared with participating platforms to preemptively block upload.",
        is_emergency=False
    )
]

def get_digital_safety_categories() -> List[DigitalCategoryGuidance]:
    return DIGITAL_SAFETY_CATEGORIES

def get_digital_category_by_id(cat_id: str) -> DigitalCategoryGuidance | None:
    for cat in DIGITAL_SAFETY_CATEGORIES:
        if cat.id == cat_id:
            return cat
    return None

def get_help_directory_resources() -> List[HelpResourceItem]:
    return HELP_DIRECTORY_RESOURCES

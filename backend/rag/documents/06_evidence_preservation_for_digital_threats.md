---
title: Best Practices for Preserving Digital Evidence of Cyber Threats & Harassment
publisher: SafeSignal Cybersecurity & Digital Forensics Standards (ISO/IEC 27037 & Indian Evidence Act Section 65B)
source_url: https://cybercrime.gov.in/Webform/Crime_AuthenEvidence.aspx
category: evidence_preservation
retrieval_date: 2026-10-24
---

# Best Practices for Preserving Digital Evidence

## 1. Why Evidence Preservation Matters
In cybercrime cases, digital evidence is highly volatile. Perpetrators often unsend messages, delete profiles, or edit comments as soon as they realize legal action is imminent. Preserving evidence immediately, correctly, and systematically ensures that law enforcement and judicial authorities can verify and trace the offender.

## 2. Screenshot Best Practices
- **Capture Entire Screen**: Avoid cropping screenshots to just the text bubble. Ensure the screen shows:
  - Full username and profile handle of the sender (not just a saved display name).
  - Exact date, time, and system clock (showing AM/PM and time zone if possible).
  - Web address bar (URL) if capturing from a web browser.
  - Network status and cellular carrier bar if on mobile.
- **Scroll Screenshots**: For lengthy conversations, capture continuous overlapping screenshots so there are no missing gaps between message bubbles.
- **Preserve Uncropped Original Images**: Do not apply photo filters, markup drawings, or stickers over any part of the image.

## 3. Web Pages and Profile URLs
- Always copy the exact URL of the suspect's profile:
  - Example: `https://instagram.com/suspect_handle/` or `https://facebook.com/profile.php?id=100012345678`
  - Note: Usernames can be changed in seconds, but unique platform numeric IDs (like Facebook User ID) remain permanent.
- Use internet archiving services (such as archive.today or Wayback Machine) where safe and appropriate to create an independent third-party timestamped record.

## 4. Email Evidence (Full Email Headers)
- Simply taking a screenshot of an email body is insufficient in court because sender email addresses can be spoofed.
- Download the original `.eml` or `.msg` file.
- View and copy the **Full RFC Headers**:
  - In Gmail: Click the three dots -> "Show original" -> "Download Original".
  - Full headers contain the originating IP address, mail transfer agents (MTA), DKIM signature, and SPF authentication records.

## 5. Storage and Organization (SafeSignal Evidence Organizer)
- Organize records by date, platform, suspect handles, and categories.
- Store sensitive files in private, encrypted cloud storage (such as the SafeSignal Evidence Vault).
- Keep a detailed chronology diary documenting every interaction, call timestamp, or encounter in chronological order.
- Legal Note: An application evidence log organizes records for police and legal reporting; official admissibility in Indian courts is governed by Section 65B of the Indian Evidence Act (Certificate of electronic records).

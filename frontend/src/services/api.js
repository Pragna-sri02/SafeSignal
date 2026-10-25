import {
  MOCK_DIGITAL_CATEGORIES,
  MOCK_HELP_RESOURCES,
  INITIAL_CONTACTS,
  INITIAL_EVIDENCE
} from './mockData'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If accessed from a mobile phone or another device on the Wi-Fi network (e.g. 192.168.x.x)
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:8000`
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

class ApiService {
  constructor() {
    this.tokenGetter = null
  }

  setTokenGetter(fn) {
    this.tokenGetter = fn
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.tokenGetter) {
      const token = await this.tokenGetter()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      return await response.text()
    } catch (err) {
      clearTimeout(timeoutId)
      throw err
    }
  }

  // --- Profile ---
  async getProfile() {
    try {
      return await this.request('/api/profile')
    } catch {
      const saved = localStorage.getItem('safesignal_demo_session')
      if (saved) {
        return JSON.parse(saved).profile
      }
      return {
        id: 'user-00000000-0000-0000-0000-000000000001',
        full_name: 'Safety User',
        phone_number: '',
        emergency_note: '',
        safety_checkin_frequency: 30,
        is_onboarding_completed: true
      }
    }
  }

  async updateProfile(data) {
    try {
      return await this.request('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    } catch {
      const saved = localStorage.getItem('safesignal_demo_session')
      const current = saved ? JSON.parse(saved) : {}
      const updated = { ...(current.profile || {}), ...data }
      localStorage.setItem('safesignal_demo_session', JSON.stringify({ ...current, profile: updated }))
      return updated
    }
  }

  // --- Contacts ---
  async getContacts() {
    try {
      const data = await this.request('/api/contacts')
      return (data || []).filter(c => !c.full_name?.includes('Aarav Sharma') && !c.full_name?.includes('Ananya Verma') && c.id !== 'c-1' && c.id !== 'c-2')
    } catch {
      const stored = localStorage.getItem('safesignal_contacts')
      if (stored) {
        try {
          const list = JSON.parse(stored)
          const userOnly = Array.isArray(list) ? list.filter(c => !c.full_name?.includes('Aarav Sharma') && !c.full_name?.includes('Ananya Verma') && c.id !== 'c-1' && c.id !== 'c-2') : []
          localStorage.setItem('safesignal_contacts', JSON.stringify(userOnly))
          return userOnly
        } catch {
          return []
        }
      }
      return []
    }
  }

  async createContact(data) {
    try {
      return await this.request('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch {
      const contacts = await this.getContacts()
      const newContact = {
        id: 'c-' + Date.now(),
        user_id: '00000000-0000-0000-0000-000000000001',
        ...data,
        created_at: new Date().toISOString()
      }
      const updated = [...contacts, newContact]
      localStorage.setItem('safesignal_contacts', JSON.stringify(updated))
      return newContact
    }
  }

  async updateContact(id, data) {
    try {
      return await this.request(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    } catch {
      const contacts = await this.getContacts()
      const updated = contacts.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      localStorage.setItem('safesignal_contacts', JSON.stringify(updated))
      return updated.find(c => c.id === id)
    }
  }

  async deleteContact(id) {
    try {
      return await this.request(`/api/contacts/${id}`, {
        method: 'DELETE'
      })
    } catch {
      const contacts = await this.getContacts()
      const updated = contacts.filter(c => c.id !== id)
      localStorage.setItem('safesignal_contacts', JSON.stringify(updated))
      return { success: true, message: 'Deleted' }
    }
  }

  async testDemoContact(id) {
    try {
      return await this.request(`/api/contacts/${id}/test-demo`, {
        method: 'POST'
      })
    } catch {
      return {
        success: true,
        message: 'Simulated alert sent in Demo Mode. (No live carrier charges incurred).'
      }
    }
  }

  // --- Physical Safety & SOS ---
  async activateSos(data) {
    try {
      return await this.request('/api/physical/sos/activate', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch {
      const contacts = await this.getContacts()
      const incident = {
        id: 'inc-' + Date.now().toString(36),
        user_id: '00000000-0000-0000-0000-000000000001',
        incident_type: 'sos',
        status: 'Sent',
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        location_accuracy: data.location_accuracy,
        address_text: data.address_text || 'Current GPS Location',
        is_demo: true,
        cancelled_at: null,
        cancel_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notifications: contacts.filter(c => c.is_sos_recipient).map(c => ({
          id: 'notif-' + Math.random().toString(36).slice(2, 7),
          channel: 'sms',
          recipient_name: c.full_name,
          recipient_phone: c.phone_number,
          delivery_status: 'demo_mode',
          provider_name: 'SafeSignal_Demo_Dispatch_Layer',
          created_at: new Date().toISOString()
        }))
      }
      localStorage.setItem('safesignal_active_sos', JSON.stringify(incident))
      return incident
    }
  }

  async cancelSos(incidentId, cancelReason = 'Accidental activation') {
    try {
      return await this.request(`/api/physical/sos/${incidentId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancel_reason: cancelReason })
      })
    } catch {
      localStorage.removeItem('safesignal_active_sos')
      return { success: true, message: 'SOS cancelled successfully.' }
    }
  }

  async getLatestSos() {
    try {
      return await this.request('/api/physical/sos/latest')
    } catch {
      const stored = localStorage.getItem('safesignal_active_sos')
      return stored ? JSON.parse(stored) : null
    }
  }

  // --- Journey Safety ---
  async startJourney(data) {
    try {
      return await this.request('/api/physical/journey/start', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch {
      const journey = {
        id: 'j-' + Date.now().toString(36),
        user_id: '00000000-0000-0000-0000-000000000001',
        destination_name: data.destination_name,
        expected_arrival_time: data.expected_arrival_time,
        status: 'active',
        last_checkin_time: new Date().toISOString(),
        checkin_interval_minutes: data.checkin_interval_minutes || 30,
        notify_contacts_on_overdue: true,
        start_lat: data.start_lat,
        start_lng: data.start_lng,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('safesignal_active_journey', JSON.stringify(journey))
      return journey
    }
  }

  async checkinJourney(journeyId) {
    try {
      return await this.request(`/api/physical/journey/${journeyId}/checkin`, {
        method: 'PUT'
      })
    } catch {
      const journey = await this.getActiveJourney()
      if (journey) {
        journey.last_checkin_time = new Date().toISOString()
        localStorage.setItem('safesignal_active_journey', JSON.stringify(journey))
        return journey
      }
      throw new Error('Journey not found')
    }
  }

  async completeJourney(journeyId) {
    try {
      return await this.request(`/api/physical/journey/${journeyId}/complete`, {
        method: 'PUT'
      })
    } catch {
      localStorage.removeItem('safesignal_active_journey')
      return { status: 'completed' }
    }
  }

  async cancelJourney(journeyId) {
    try {
      return await this.request(`/api/physical/journey/${journeyId}/cancel`, {
        method: 'PUT'
      })
    } catch {
      localStorage.removeItem('safesignal_active_journey')
      return { status: 'cancelled' }
    }
  }

  async getActiveJourney() {
    try {
      return await this.request('/api/physical/journey/active')
    } catch {
      const stored = localStorage.getItem('safesignal_active_journey')
      return stored ? JSON.parse(stored) : null
    }
  }

  // --- Digital Protection ---
  async getDigitalCategories() {
    try {
      const data = await this.request('/api/digital/categories')
      if (data && data.length > 0) return data
      return MOCK_DIGITAL_CATEGORIES
    } catch {
      return MOCK_DIGITAL_CATEGORIES
    }
  }

  async getDigitalCategory(categoryId) {
    try {
      return await this.request(`/api/digital/categories/${categoryId}`)
    } catch {
      return MOCK_DIGITAL_CATEGORIES.find(c => c.id === categoryId) || MOCK_DIGITAL_CATEGORIES[0]
    }
  }

  // --- AI Safety Assistant ---
  async askAssistant(message, conversationHistory = []) {
    try {
      return await this.request('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory
        })
      })
    } catch {
      // Local Grounded RAG Generator
      const msg = message.toLowerCase()
      const isUrgent = msg.includes('follow') || msg.includes('threat') || msg.includes('danger') || msg.includes('outside') || msg.includes('help me')

      if (msg.includes('hack') || msg.includes('compromised') || msg.includes('password')) {
        return {
          answer: "Here is the official recovery response protocol for compromised accounts:\n\n1. **Use Official Recovery Channels**: Direct your browser to https://instagram.com/hacked or https://accounts.google.com/signin/recovery.\n2. **Look for Security Emails**: Search your inbox for messages from security@mail.instagram.com containing 'Revert this change'.\n3. **Submit Identity Verification**: Use the Video Selfie Verification in the app to prove your identity against your photos.\n4. **Revoke Active Sessions**: Terminate all unfamiliar device logins and switch to an Authenticator app (e.g. Google Authenticator) for 2FA.\n\n⚠️ *Warning: Never pay third-party recovery scammers in DMs. Official platforms never ask for passwords.*",
          citations: [
            {
              title: "Official Account Recovery & Protection for Compromised Social Accounts",
              publisher: "SafeSignal Cyber Safety Working Group & Meta / Google Documentation",
              source_url: "https://www.instagram.com/hacked",
              snippet: "Direct recovery link for hacked Instagram accounts with selfie video identity proof and session invalidation."
            }
          ],
          is_urgent: false,
          suggested_actions: ["Open Instagram Hacked Portal", "Check Security Emails", "Add Evidence Record"]
        }
      }

      if (msg.includes('fake') || msg.includes('impersonat') || msg.includes('photo')) {
        return {
          answer: "If someone created a fake profile using your photos:\n\n1. **Do Not Direct Message the Imposter**: Direct engagement may provoke further harassment.\n2. **Copy the Full Profile URL**: Capture the exact browser URL showing their unique account handle.\n3. **Submit Official Impersonation Form**: Use the platform's impersonation reporting form with government photo ID proof.\n4. **Report on cybercrime.gov.in**: File a formal report under 'Report Crime Related to Women/Children' (Section 66D IT Act for cheating by personation).\n5. **Preserve Screenshots**: Store complete uncropped screenshots in your SafeSignal Evidence Vault.",
          citations: [
            {
              title: "Combating Online Harassment, Cyberbullying, and Impersonation",
              publisher: "National Cyber Crime Reporting Portal & IT Act Legal Framework",
              source_url: "https://cybercrime.gov.in",
              snippet: "Filing complaints for impersonation and fake profiles under Section 66D of the IT Act."
            }
          ],
          is_urgent: false,
          suggested_actions: ["Submit Meta Impersonation Form", "File cybercrime.gov.in Report", "Save Profile Screenshots"]
        }
      }

      return {
        answer: (isUrgent ? "🚨 **URGENT SAFETY ALERT**: If you are facing an active physical threat, dial **112 (Emergency Police)** immediately or tap the SOS button on your SafeSignal dashboard.\n\n" : "") +
          "Based on trusted safety standards:\n\n1. **Assess Immediate Safety**: In any physical emergency, call **112** (Pan-India Police) or **181** (Women Helpline).\n2. **For Cyber Incidents**: Report at [https://cybercrime.gov.in](https://cybercrime.gov.in) or dial Cybercrime Helpline **1930**.\n3. **Evidence Preservation**: Save full uncropped screenshots showing date, time, and user handles before blocking offenders.\n4. **Account Security**: Check active sessions and activate app-based two-factor authentication.",
        citations: [
          {
            title: "Emergency Response Support System (ERSS 112) & 181 Women Helpline",
            publisher: "Ministry of Home Affairs & Ministry of Women and Child Development",
            source_url: "https://112.gov.in",
            snippet: "Pan-India 24/7 single emergency number for police, fire, and ambulance dispatch."
          }
        ],
        is_urgent: isUrgent,
        suggested_actions: ["Call 112 Immediately", "Activate Emergency SOS", "Report on Cybercrime Portal"]
      }
    }
  }

  // --- Evidence Organizer ---
  async getEvidence(category = null, search = null) {
    try {
      const params = new URLSearchParams()
      if (category && category !== 'all') params.append('category', category)
      if (search) params.append('search', search)
      const qs = params.toString() ? `?${params.toString()}` : ''
      return await this.request(`/api/evidence${qs}`)
    } catch {
      const stored = localStorage.getItem('safesignal_evidence')
      let list = stored ? JSON.parse(stored) : INITIAL_EVIDENCE
      if (!stored) localStorage.setItem('safesignal_evidence', JSON.stringify(INITIAL_EVIDENCE))
      if (category && category !== 'all') {
        list = list.filter(item => item.category === category)
      }
      if (search) {
        const s = search.toLowerCase()
        list = list.filter(item => item.title.toLowerCase().includes(s) || item.description.toLowerCase().includes(s))
      }
      return list
    }
  }

  async createEvidence(data) {
    try {
      return await this.request('/api/evidence', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch {
      const stored = localStorage.getItem('safesignal_evidence')
      const list = stored ? JSON.parse(stored) : INITIAL_EVIDENCE
      const newRec = {
        id: 'ev-' + Date.now().toString(36),
        user_id: '00000000-0000-0000-0000-000000000001',
        ...data,
        file_attachments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updated = [newRec, ...list]
      localStorage.setItem('safesignal_evidence', JSON.stringify(updated))
      return newRec
    }
  }

  async getEvidenceById(id) {
    try {
      return await this.request(`/api/evidence/${id}`)
    } catch {
      const list = await this.getEvidence()
      return list.find(r => r.id === id) || null
    }
  }

  async updateEvidence(id, data) {
    try {
      return await this.request(`/api/evidence/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    } catch {
      const stored = localStorage.getItem('safesignal_evidence')
      const list = stored ? JSON.parse(stored) : INITIAL_EVIDENCE
      const updated = list.map(r => r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r)
      localStorage.setItem('safesignal_evidence', JSON.stringify(updated))
      return updated.find(r => r.id === id)
    }
  }

  async deleteEvidence(id) {
    try {
      return await this.request(`/api/evidence/${id}`, {
        method: 'DELETE'
      })
    } catch {
      const stored = localStorage.getItem('safesignal_evidence')
      const list = stored ? JSON.parse(stored) : INITIAL_EVIDENCE
      const updated = list.filter(r => r.id !== id)
      localStorage.setItem('safesignal_evidence', JSON.stringify(updated))
      return { success: true, message: 'Deleted' }
    }
  }

  async getEvidenceSummary(id) {
    try {
      return await this.request(`/api/evidence/${id}/summary`)
    } catch {
      const record = await this.getEvidenceById(id)
      return `================================================================================
SAFESIGNAL - CONFIDENTIAL INCIDENT EVIDENCE SUMMARY
Generated for: Formal Police Complaint / Cybercrime Reporting Portal
Report Reference ID: ${record?.id || id}
Generated At: ${new Date().toUTCString()}
================================================================================

1. COMPLAINANT INFORMATION
--------------------------
Platform ID: SafeSignal Verified Account

2. INCIDENT DETAILS
-------------------
Incident Title: ${record?.title || 'Safety Incident'}
Category: ${(record?.category || 'General').toUpperCase().replace('_', ' ')}
Date & Time of Occurrence: ${record?.incident_date || 'N/A'}
Current Status: ${(record?.reporting_status || 'Evidence Preserved').toUpperCase()}

3. DIGITAL FOOTPRINT & SUSPECT DETAILS
--------------------------------------
Platform / Service Involved: ${record?.platform_name || 'Not Specified'}
Suspect Handle / Profile / Phone: ${record?.suspect_identifier || 'Unknown / Masked'}
Offending Content URL: ${record?.incident_url || 'N/A'}

4. DETAILED CHRONOLOGY & DESCRIPTION
------------------------------------
${record?.description || 'N/A'}

5. EVIDENCE NOTES & FORENSIC OBSERVATIONS
-----------------------------------------
${record?.notes || 'Screenshots and raw transcripts preserved in user encrypted vault.'}

================================================================================
DISCLAIMER & LEGAL CITATION:
This document is an organized incident summary generated by the complainant via
the SafeSignal Platform. Under Section 65B of the Indian Evidence Act, 1872 /
Bharatiya Sakshya Adhiniyam, digital evidence preserved with timestamps and
metadata should be accompanied by the prescribed certificate when submitted to court.
================================================================================`
    }
  }

  // --- Help Directory ---
  async getHelpDirectory() {
    try {
      const data = await this.request('/api/help/directory')
      if (data && data.length > 0) return data
      return MOCK_HELP_RESOURCES
    } catch {
      return MOCK_HELP_RESOURCES
    }
  }
}

export const api = new ApiService()

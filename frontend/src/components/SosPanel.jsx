import React, { useState, useEffect } from 'react'
import {
  AlertOctagon,
  MapPin,
  PhoneCall,
  XCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  Navigation,
  MessageCircle,
  Send,
  Users,
  ExternalLink,
  Share2
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

export const SosPanel = ({ onIncidentCreated }) => {
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [activeIncident, setActiveIncident] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [locationCoords, setLocationCoords] = useState(null)
  const [contacts, setContacts] = useState([])
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('Accidental button tap')

  // Load any existing active incident and trusted contacts on mount
  useEffect(() => {
    loadLatestIncident()
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await api.getContacts()
      setContacts(data || [])
    } catch (err) {
      console.warn('Could not load contacts:', err)
    }
  }

  const loadLatestIncident = async () => {
    try {
      const incident = await api.getLatestSos()
      if (incident && incident.status === 'Sent') {
        setActiveIncident(incident)
      }
    } catch (err) {
      // Non-blocking
    }
  }

  const generateSosMessage = () => {
    const mapsLink = locationCoords
      ? `https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lng}`
      : 'Location GPS coordinates not provided'

    return `🚨 EMERGENCY ALERT FROM SAFESIGNAL 🚨\n\nI am in immediate danger and need urgent help!\n\n📍 My Live GPS Location:\n${mapsLink}\n\n⏰ Time: ${new Date().toLocaleTimeString()}\n\nPlease call me or reach out immediately, or contact emergency services 112!`
  }

  const cleanPhone = (phone) => {
    if (!phone) return ''
    return phone.replace(/[^0-9+]/g, '')
  }

  const getWhatsAppLink = (phone) => {
    const digits = cleanPhone(phone)
    const fullNumber = digits.startsWith('+') ? digits.slice(1) : (digits.length === 10 ? '91' + digits : digits)
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(generateSosMessage())}`
  }

  const getSmsLink = (phone) => {
    return `sms:${cleanPhone(phone)}?body=${encodeURIComponent(generateSosMessage())}`
  }

  const getCallLink = (phone) => {
    return `tel:${cleanPhone(phone)}`
  }

  const getWhatsAppBroadcastLink = () => {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(generateSosMessage())}`
  }

  // Request browser location permission transparently
  const requestLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'warning')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setLocationPermission('granted')
        addToast('Location access granted for emergency coordinates.', 'success')
      },
      (error) => {
        console.warn('Geolocation error:', error)
        setLocationPermission('denied')
        addToast('Location permission denied or unavailable. SOS can still be activated without coordinates.', 'warning')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Initiate SOS with 3-second urgent cancellation window
  const startSosCountdown = () => {
    // If location is not yet requested, attempt quick fetch
    if (!locationCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          })
          setLocationPermission('granted')
        },
        () => {},
        { timeout: 3000 }
      )
    }

    setCountdown(3)
  }

  // Countdown timer effect
  useEffect(() => {
    let timer = null
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setCountdown(null)
      triggerSosEmergency()
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const cancelCountdown = () => {
    setCountdown(null)
    addToast('SOS activation aborted.', 'info')
  }

  const triggerSosEmergency = async () => {
    setLoading(true)
    try {
      const payload = {
        location_lat: locationCoords?.lat || null,
        location_lng: locationCoords?.lng || null,
        location_accuracy: locationCoords?.accuracy || null,
        address_text: locationCoords ? `GPS Coordinates (${locationCoords.lat.toFixed(4)}, ${locationCoords.lng.toFixed(4)})` : 'Location not shared'
      }

      const incident = await api.activateSos(payload)
      setActiveIncident(incident)
      addToast('EMERGENCY SOS ACTIVATED. Emergency notifications dispatched to trusted contacts.', 'danger')
      if (onIncidentCreated) {
        onIncidentCreated(incident)
      }
    } catch (err) {
      addToast(`SOS Activation Failed: ${err.message}`, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelIncident = async () => {
    if (!activeIncident) return
    setLoading(true)
    try {
      await api.cancelSos(activeIncident.id, cancelReason)
      setActiveIncident(null)
      setCancelModalOpen(false)
      addToast('Emergency SOS cancelled and resolved.', 'success')
    } catch (err) {
      addToast(`Error cancelling incident: ${err.message}`, 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{
      border: activeIncident ? '2px solid var(--color-emergency-red)' : '1px solid var(--border-color)',
      backgroundColor: activeIncident ? 'rgba(225, 29, 72, 0.03)' : 'var(--bg-surface)'
    }}>
      {/* SOS Header */}
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertOctagon size={24} color="var(--color-emergency-red)" />
            {t('sos_title')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {t('sos_subtitle')}
          </p>
        </div>
        <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="beacon-dot"></span> Live Protected
        </span>
      </div>

      {/* Active Incident State Banner */}
      {activeIncident ? (
        <div style={{ marginTop: 12 }}>
          <div className="alert-banner alert-danger" style={{ flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertOctagon size={20} />
                <strong>{t('sos_active_banner')} (#{activeIncident.id.slice(0, 8)})</strong>
              </div>
              <span className="badge badge-red">Status: {activeIncident.status}</span>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              Alert recorded at {new Date(activeIncident.created_at).toLocaleTimeString()}. Dispatched {activeIncident.notifications?.length || 0} simulated notification(s).
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            <a href="tel:112" className="btn btn-danger btn-lg" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <PhoneCall size={20} />
              {t('sos_call_police')}
            </a>
            <button
              onClick={() => setCancelModalOpen(true)}
              className="btn btn-outline"
              disabled={loading}
              style={{ borderColor: 'var(--color-emergency-red)', color: 'var(--color-emergency-red)' }}
            >
              <XCircle size={18} />
              {t('sos_cancel_false_alarm')}
            </button>
          </div>

          {/* Direct 1-Tap Emergency Alerts for Trusted Contacts */}
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 18, textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--color-emergency-red)" />
              {t('sos_contacts_heading')}
            </h3>

            {/* Quick Broadcast Button to Any WhatsApp Chat / Group */}
            <a
              href={getWhatsAppBroadcastLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg"
              style={{
                width: '100%',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={20} />
              <span>{t('sos_broadcast_whatsapp')}</span>
            </a>

            {/* List of Configured Contacts */}
            {contacts.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: '0.875rem'
              }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {t('sos_no_contacts_warn')}
                </p>
                <a href="/trusted-contacts" className="btn btn-sm btn-primary">
                  {t('sos_add_contacts_btn')}
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contacts.filter(c => c.is_sos_recipient !== false).map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {contact.full_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {contact.relationship} • {contact.phone_number}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* WhatsApp Alert Button */}
                      <a
                        href={getWhatsAppLink(contact.phone_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#25D366',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 650,
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          textDecoration: 'none'
                        }}
                        title="Send live emergency location to this contact on WhatsApp"
                      >
                        <MessageCircle size={14} />
                        <span>{t('sos_btn_whatsapp')}</span>
                      </a>

                      {/* Native SMS Alert Button */}
                      <a
                        href={getSmsLink(contact.phone_number)}
                        className="btn btn-sm btn-outline"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          textDecoration: 'none'
                        }}
                        title="Open phone SMS app with pre-filled emergency alert"
                      >
                        <Send size={14} color="var(--color-violet)" />
                        <span>{t('sos_btn_sms')}</span>
                      </a>

                      {/* Phone Call Button */}
                      <a
                        href={getCallLink(contact.phone_number)}
                        className="btn btn-sm btn-outline"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          textDecoration: 'none'
                        }}
                        title="Call contact immediately"
                      >
                        <PhoneCall size={14} color="var(--color-teal)" />
                        <span>{t('sos_btn_call')}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Inactive State: Ready to Activate */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center' }}>
          {countdown !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                backgroundColor: 'var(--color-emergency-red)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 800,
                animation: 'pulse-sos 1s infinite'
              }}>
                {countdown}
              </div>
              <p style={{ fontWeight: 700, color: 'var(--color-emergency-red)', fontSize: '1.1rem' }}>
                {t('sos_countdown_msg', { sec: countdown })}
              </p>
              <button onClick={cancelCountdown} className="btn btn-outline btn-sm">
                <XCircle size={16} /> {t('sos_cancel_countdown')}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={startSosCountdown}
                className="btn-sos"
                disabled={loading}
                aria-label={t('btn_activate_sos')}
              >
                {loading ? <Loader2 size={24} className="spin" /> : <AlertOctagon size={28} />}
                <span>{t('btn_activate_sos')}</span>
              </button>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 14, maxWidth: 440 }}>
                Pressing activates a 3-second safeguard countdown. Coordinates will be shared with configured contacts.
              </p>
            </>
          )}

          {/* Location Permission Badge & Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 20,
            padding: '8px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem'
          }}>
            <MapPin size={16} color={locationCoords ? "var(--color-teal)" : "var(--text-muted)"} />
            <span>
              {locationCoords
                ? `${t('sos_location_shared')}: ${locationCoords.lat.toFixed(3)}, ${locationCoords.lng.toFixed(3)}`
                : t('sos_location_prompt')}
            </span>
            {!locationCoords && (
              <button
                onClick={requestLocation}
                className="btn btn-sm btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                {t('sos_enable_gps')}
              </button>
            )}
          </div>

          {/* How alert messages work explainer */}
          <div style={{
            marginTop: 22,
            padding: '12px 18px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            width: '100%',
            maxWidth: 520,
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            border: '1px solid var(--border-color)'
          }}>
            <ShieldAlert size={18} color="var(--color-violet)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                {t('sos_how_it_works')}
              </strong>
              {t('sos_how_it_works_desc')}
            </div>
          </div>
        </div>
      )}

      {/* Accidental Activation Safeguard Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={20} color="var(--color-emergency-red)" />
                {t('cancel_modal_title')}
              </h3>
              <button onClick={() => setCancelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={18} />
              </button>
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                {t('cancel_modal_desc')}
              </p>
              <div className="form-group">
                <label className="form-label">{t('cancel_reason_label')}</label>
                <select
                  className="form-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Accidental button tap">{t('reason_accidental')}</option>
                  <option value="Situation safely resolved">{t('reason_resolved')}</option>
                  <option value="Reached trusted location">{t('reason_reached')}</option>
                  <option value="Assistance no longer needed">{t('reason_not_needed')}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setCancelModalOpen(false)} className="btn btn-outline">
                {t('keep_alert_active')}
              </button>
              <button onClick={handleCancelIncident} className="btn btn-danger" disabled={loading}>
                {loading ? '...' : t('confirm_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

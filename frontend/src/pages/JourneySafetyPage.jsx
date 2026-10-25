import React, { useState, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Send,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { LoadingState } from '../components/LoadingState'

export const JourneySafetyPage = () => {
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [activeJourney, setActiveJourney] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Start Form
  const [destination, setDestination] = useState('')
  const [expectedTimeMinutes, setExpectedTimeMinutes] = useState(30)
  const [checkinInterval, setCheckinInterval] = useState(15)
  const [notes, setNotes] = useState('')
  const [shareLocation, setShareLocation] = useState(true)

  useEffect(() => {
    loadActiveJourney()
  }, [])

  const loadActiveJourney = async () => {
    try {
      const data = await api.getActiveJourney()
      setActiveJourney(data)
    } catch (err) {
      // non-blocking
    } finally {
      setLoading(false)
    }
  }

  const handleStartJourney = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      addToast('Please enter your destination.', 'warning')
      return
    }

    setActionLoading(true)
    try {
      const now = new Date()
      const arrivalDate = new Date(now.getTime() + expectedTimeMinutes * 60 * 1000)

      let startLat = null
      let startLng = null

      if (shareLocation && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
          })
          startLat = pos.coords.latitude
          startLng = pos.coords.longitude
        } catch (e) {
          console.warn('Geolocation lookup skipped:', e)
        }
      }

      const payload = {
        destination_name: destination.trim(),
        expected_arrival_time: arrivalDate.toISOString(),
        checkin_interval_minutes: Number(checkinInterval),
        notify_contacts_on_overdue: true,
        start_lat: startLat,
        start_lng: startLng,
        notes: notes.trim()
      }

      const journey = await api.startJourney(payload)
      setActiveJourney(journey)
      addToast(`Journey started! SafeSignal is monitoring your arrival to ${destination}.`, 'success')
      setDestination('')
      setNotes('')
    } catch (err) {
      addToast(`Could not start journey: ${err.message}`, 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleManualCheckin = async () => {
    if (!activeJourney) return
    setActionLoading(true)
    try {
      const updated = await api.checkinJourney(activeJourney.id)
      setActiveJourney(updated)
      addToast('Check-in logged! Status confirmed safe.', 'success')
    } catch (err) {
      addToast('Check-in failed: ' + err.message, 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteJourney = async () => {
    if (!activeJourney) return
    setActionLoading(true)
    try {
      await api.completeJourney(activeJourney.id)
      setActiveJourney(null)
      addToast('Journey completed safely! Monitoring session closed.', 'success')
    } catch (err) {
      addToast('Error ending journey: ' + err.message, 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelJourney = async () => {
    if (!activeJourney) return
    setActionLoading(true)
    try {
      await api.cancelJourney(activeJourney.id)
      setActiveJourney(null)
      addToast('Journey cancelled.', 'info')
    } catch (err) {
      addToast('Error: ' + err.message, 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: t('nav_journey') }]} />

      <div className="page-header">
        <h1 className="page-title">{t('journey_page_title')}</h1>
        <p className="page-subtitle">
          {t('journey_page_subtitle')}
        </p>
      </div>

      {loading ? (
        <LoadingState message="Checking active journeys..." />
      ) : activeJourney ? (
        /* Active Journey Monitoring Screen */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <div className="card" style={{ borderTop: '4px solid var(--color-teal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="badge badge-teal">
                {t('journey_active_session')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ID: {activeJourney.id.slice(0, 8)}
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 8 }}>
              {t('journey_en_route')} {activeJourney.destination_name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '20px 0', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color="var(--color-teal)" />
                <span>
                  {t('journey_expected_arrival')} <strong>{new Date(activeJourney.expected_arrival_time).toLocaleTimeString()}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-violet)" />
                <span>
                  {t('journey_last_checkin')} <strong>{new Date(activeJourney.last_checkin_time).toLocaleTimeString()}</strong>
                </span>
              </div>
              {activeJourney.notes && (
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <em style={{ fontSize: '0.85rem' }}>{activeJourney.notes}</em>
                </div>
              )}
            </div>

            {/* Check-in & Complete Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <button
                onClick={handleManualCheckin}
                className="btn btn-teal"
                style={{ flex: 1 }}
                disabled={actionLoading}
              >
                <CheckCircle2 size={18} />
                <span>{t('btn_im_safe')}</span>
              </button>

              <button
                onClick={handleCompleteJourney}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={actionLoading}
              >
                <CheckCircle2 size={18} />
                <span>{t('btn_arrived')}</span>
              </button>

              <button
                onClick={handleCancelJourney}
                className="btn btn-outline"
                disabled={actionLoading}
              >
                <XCircle size={18} />
                <span>{t('btn_cancel')}</span>
              </button>
            </div>
          </div>

          {/* Missed Check-in & Escalation Safeguards */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} color="var(--color-warning-amber)" />
              {t('journey_overdue_title')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              {t('journey_overdue_desc')}
            </p>
            <ol style={{ paddingLeft: 20, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)' }}>
              <li>{t('journey_overdue_step1')}</li>
              <li>{t('journey_overdue_step2')}</li>
              <li>{t('journey_overdue_step3')}</li>
            </ol>

            <div style={{ marginTop: 24, padding: 14, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
              <strong>Privacy Guarantee:</strong> {t('journey_privacy_note')}
            </div>
          </div>
        </div>
      ) : (
        /* Start Journey Form */
        <div style={{ maxWidth: 640 }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Compass size={22} color="var(--color-teal)" />
              {t('journey_start_title')}
            </h2>

            <form onSubmit={handleStartJourney}>
              <div className="form-group">
                <label className="form-label" htmlFor="destInput">{t('journey_dest_label')}</label>
                <input
                  id="destInput"
                  type="text"
                  className="form-input"
                  placeholder={t('journey_dest_placeholder')}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="durationSelect">{t('journey_duration_label')}</label>
                  <select
                    id="durationSelect"
                    className="form-select"
                    value={expectedTimeMinutes}
                    onChange={(e) => setExpectedTimeMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkinSelect">{t('journey_interval_label')}</label>
                  <select
                    id="checkinSelect"
                    className="form-select"
                    value={checkinInterval}
                    onChange={(e) => setCheckinInterval(Number(e.target.value))}
                  >
                    <option value={10}>Every 10 min</option>
                    <option value={15}>Every 15 min</option>
                    <option value={30}>Every 30 min</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notesInput">{t('journey_notes_label')}</label>
                <input
                  id="notesInput"
                  type="text"
                  className="form-input"
                  placeholder={t('journey_notes_placeholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareLocation}
                    onChange={(e) => setShareLocation(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-teal)' }}
                  />
                  <span>{t('journey_share_loc')}</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-teal btn-lg"
                style={{ width: '100%' }}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 size={18} className="spin" /> : <Navigation size={18} />}
                <span>{t('btn_start_journey')}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

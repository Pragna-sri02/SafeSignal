import React, { useState, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  Settings,
  User,
  Shield,
  Save,
  Lock,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

export const SettingsPage = () => {
  const { user, profile, updateLocalProfile, isDemoUser, signOut } = useAuth()
  const { addToast } = useToast()
  const { t } = useLanguage()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emergencyNote, setEmergencyNote] = useState('')
  const [checkinFrequency, setCheckinFrequency] = useState(30)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhoneNumber(profile.phone_number || '')
      setEmergencyNote(profile.emergency_note || '')
      setCheckinFrequency(profile.safety_checkin_frequency || 30)
    }
  }, [profile])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        emergency_note: emergencyNote.trim(),
        safety_checkin_frequency: Number(checkinFrequency)
      }
      const updated = await api.updateProfile(updates)
      updateLocalProfile(updated)
      addToast('Safety profile and preferences saved.', 'success')
    } catch (err) {
      addToast('Error saving profile: ' + err.message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 840 }}>
      <Breadcrumb items={[{ label: t('nav_settings') }]} />

      <div className="page-header">
        <h1 className="page-title">{t('nav_settings')}</h1>
        <p className="page-subtitle">
          {t('settings_subtitle')}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={20} color="var(--color-violet)" />
          {t('settings_profile_card')}
        </h2>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="nameInput">{t('settings_full_name')}</label>
              <input
                id="nameInput"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('settings_full_name_ph')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneInput">{t('settings_phone')}</label>
              <input
                id="phoneInput"
                type="tel"
                className="form-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="noteInput">{t('settings_medical_note')}</label>
            <textarea
              id="noteInput"
              className="form-textarea"
              placeholder={t('settings_medical_note_ph')}
              value={emergencyNote}
              onChange={(e) => setEmergencyNote(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="freqSelect">{t('settings_checkin_freq')}</label>
            <select
              id="freqSelect"
              className="form-select"
              value={checkinFrequency}
              onChange={(e) => setCheckinFrequency(Number(e.target.value))}
            >
              <option value={15}>{t('settings_freq_15')}</option>
              <option value={30}>{t('settings_freq_30')}</option>
              <option value={45}>{t('settings_freq_45')}</option>
              <option value={60}>{t('settings_freq_60')}</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? '...' : t('settings_save_btn')}</span>
          </button>
        </form>
      </div>

      {/* Security, Privacy & Transparency Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="var(--color-teal)" />
          {t('settings_privacy_card')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <EyeOff size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>{t('settings_zero_track_title')}</strong> {t('settings_zero_track_desc')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Lock size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>{t('settings_rls_title')}</strong> {t('settings_rls_desc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

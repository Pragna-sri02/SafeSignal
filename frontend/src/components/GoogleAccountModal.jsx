import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, ShieldCheck, Key, LogIn, ExternalLink } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getGoogleClientId, setGoogleClientId, triggerGoogleOAuth } from '../services/googleAuth'

export const GoogleAccountModal = ({ isOpen, onClose, onSelectAccount }) => {
  const { t } = useLanguage()
  const [accounts, setAccounts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showClientIdConfig, setShowClientIdConfig] = useState(false)
  const [clientIdInput, setClientIdInput] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setClientIdInput(getGoogleClientId())
      const stored = localStorage.getItem('safesignal_google_accounts')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Filter out any mock dummy accounts
          const userOnly = (Array.isArray(parsed) ? parsed : []).filter(
            a => !a.email?.includes('priya') && !a.email?.includes('aarav') && !a.full_name?.includes('Priya') && !a.full_name?.includes('Aarav')
          )
          setAccounts(userOnly)
          localStorage.setItem('safesignal_google_accounts', JSON.stringify(userOnly))
          setShowAddForm(userOnly.length === 0)
        } catch {
          setAccounts([])
          setShowAddForm(true)
        }
      } else {
        setAccounts([])
        setShowAddForm(true)
      }
      setEmail('')
      setFullName('')
      setFormError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = (account) => {
    onSelectAccount(account)
    onClose()
  }

  const handleAddNewAccount = (e) => {
    e.preventDefault()
    setFormError('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid Google email address.')
      return
    }

    if (!cleanName) {
      setFormError('Please enter your full name.')
      return
    }

    const newAccount = {
      id: 'google-' + Math.random().toString(36).substring(2, 11),
      email: cleanEmail,
      full_name: cleanName,
      avatar_initial: cleanName.charAt(0).toUpperCase()
    }

    const updated = [newAccount, ...accounts.filter(a => a.email !== cleanEmail)]
    setAccounts(updated)
    localStorage.setItem('safesignal_google_accounts', JSON.stringify(updated))

    onSelectAccount(newAccount)
    onClose()
  }

  const handleRemoveAccount = (e, emailToRemove) => {
    e.stopPropagation()
    const updated = accounts.filter(a => a.email !== emailToRemove)
    setAccounts(updated)
    localStorage.setItem('safesignal_google_accounts', JSON.stringify(updated))
    if (updated.length === 0) {
      setShowAddForm(true)
    }
  }

  const handleSaveClientId = (e) => {
    e.preventDefault()
    const trimmed = clientIdInput.trim()
    setGoogleClientId(trimmed)
    setShowClientIdConfig(false)
    if (trimmed) {
      triggerGoogleOAuth({
        onSuccess: (acc) => {
          onSelectAccount(acc)
          onClose()
        },
        onError: (err) => {
          setFormError('Google popup error: ' + err.message)
        }
      })
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-container" style={{
        maxWidth: 480,
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header with Google Logo & Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Google Sign-In</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'left', marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {t('google_choose_account')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {t('google_continue_to')} SafeSignal
          </p>
        </div>

        {/* Existing Accounts List */}
        {accounts.length > 0 && !showAddForm && !showClientIdConfig && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {accounts.map((acc) => (
              <div
                key={acc.email}
                onClick={() => handleSelect(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}>
                    {acc.avatar_initial || acc.full_name?.charAt(0).toUpperCase() || 'G'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                      {acc.full_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {acc.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveAccount(e, acc.email)}
                  title="Remove account from device"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 6,
                    borderRadius: 6
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowAddForm(true)}
              type="button"
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'center',
                marginTop: 6,
                padding: '10px 16px'
              }}
            >
              <Plus size={16} />
              <span>{t('google_use_another')}</span>
            </button>
          </div>
        )}

        {/* Enter Your Own Google Account Form */}
        {showAddForm && !showClientIdConfig && (
          <form onSubmit={handleAddNewAccount} style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Enter your Google Account email & name to sign in directly with your identity:
            </p>

            {formError && (
              <div className="alert-banner alert-danger" style={{ marginBottom: 14 }}>
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('google_enter_email')}</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('google_enter_name')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {t('google_btn_continue')}
              </button>
            </div>
          </form>
        )}

        {/* Connect Official Google Cloud Client ID (OAuth) */}
        {showClientIdConfig && (
          <form onSubmit={handleSaveClientId} style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              To enable the native Google popup window listing your logged-in Google accounts, paste your free Google OAuth Client ID below:
            </p>
            <div className="form-group">
              <label className="form-label">Google OAuth Client ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="xxxx.apps.googleusercontent.com"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setShowClientIdConfig(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                Save & Open Google
              </button>
            </div>
          </form>
        )}

        {/* Bottom Helper Bar */}
        {!showClientIdConfig && (
          <div style={{
            marginTop: 20,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: '0.785rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={14} color="var(--color-violet)" />
              <span>Native Google OAuth Popup</span>
            </div>
            <button
              type="button"
              onClick={() => setShowClientIdConfig(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-violet)',
                fontWeight: 700,
                fontSize: '0.785rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Configure Client ID
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

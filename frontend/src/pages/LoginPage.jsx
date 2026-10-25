import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { isSupabaseConfigured } from '../services/supabase'
import { GoogleAccountModal } from '../components/GoogleAccountModal'
import { triggerGoogleOAuth } from '../services/googleAuth'

export const LoginPage = () => {
  const { signIn, signInWithGoogleAccount, signInWithGoogleOAuth } = useAuth()
  const { addToast } = useToast()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')
  const supabaseActive = isSupabaseConfigured()

  const handleGoogleClick = () => {
    setError('')
    setGoogleLoading(true)
    triggerGoogleOAuth({
      onSuccess: (account) => {
        setGoogleLoading(false)
        handleSelectGoogleAccount(account)
      },
      onError: (err) => {
        setGoogleLoading(false)
        setError(err.message || 'Google sign-in encountered an issue.')
      },
      onNeedConfig: () => {
        setGoogleLoading(false)
        setGoogleModalOpen(true)
      }
    })
  }

  const handleSelectGoogleAccount = (account) => {
    signInWithGoogleAccount(account)
    addToast(`Signed in with Google as ${account.full_name}.`, 'success')
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please provide both email address and password.')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      addToast('Signed in successfully.', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--navbar-height))',
      padding: '32px 16px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: 14,
            boxShadow: '0 4px 18px rgba(124, 58, 237, 0.35)'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t('auth_welcome_back')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            {t('auth_login_subtitle')}
          </p>
        </div>

        {/* Google Quick Sign In */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button
            onClick={handleGoogleClick}
            type="button"
            disabled={googleLoading}
            className="btn"
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-color)',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.925rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{googleLoading ? 'Connecting...' : t('auth_continue_google')}</span>
          </button>
        </div>

        <div style={{
          position: 'relative',
          textAlign: 'center',
          margin: '18px 0',
          borderTop: '1px solid var(--border-color)'
        }}>
          <span style={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-surface)',
            padding: '0 12px',
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            {t('auth_or_email')}
          </span>
        </div>

        {error && (
          <div className="alert-banner alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth_email_label')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder={t('auth_email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('auth_password_label')}</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={t('auth_password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '...' : t('btn_signin')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {t('auth_no_account')}{' '}
          <Link to="/register" style={{ fontWeight: 700 }}>
            {t('btn_register')}
          </Link>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      <GoogleAccountModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  )
}

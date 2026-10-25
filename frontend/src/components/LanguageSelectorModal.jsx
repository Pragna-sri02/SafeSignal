import React from 'react'
import { Globe, Check, ArrowRight, Shield } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const LanguageSelectorModal = () => {
  const {
    showLanguageModal,
    setShowLanguageModal,
    language,
    setLanguage,
    availableLanguages,
    confirmLanguageSelection,
    t
  } = useLanguage()

  if (!showLanguageModal) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-container" style={{ maxWidth: 540, padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--color-violet), var(--color-teal))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          marginBottom: 16,
          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
        }}>
          <Globe size={28} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 6 }}>
          {t('lang_modal_title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
          {t('lang_modal_subtitle')}
        </p>

        {/* 4 Interactive Language Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 24
        }}>
          {availableLanguages.map((lang) => {
            const isSelected = language === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-violet)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--color-violet-light)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--shadow-md), var(--glow-active)' : 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-violet)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <span style={{ fontSize: '1.5rem', marginBottom: 6 }}>{lang.flag}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {lang.native}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {lang.label}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={confirmLanguageSelection}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginBottom: 12 }}
        >
          <span>{t('lang_modal_continue')}</span>
          <ArrowRight size={18} />
        </button>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('lang_change_anytime')}
        </p>
      </div>
    </div>
  )
}

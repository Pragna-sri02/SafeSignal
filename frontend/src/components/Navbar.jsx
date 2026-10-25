import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, PhoneCall, Moon, Sun, Menu, X, User, LogOut, Lock, Radio } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageDropdown } from './LanguageDropdown'

export const Navbar = () => {
  const { user, profile, signOut, isDemoUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'var(--card-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1440,
        margin: '0 auto'
      }}>
        {/* Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to={user ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                Safe<span style={{ color: 'var(--color-violet)' }}>Signal</span>
              </span>
            </div>
          </Link>

          {/* Protection Pill */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            backgroundColor: 'var(--color-teal-light)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            fontSize: '0.785rem',
            color: 'var(--color-teal)',
            fontWeight: 700
          }} id="nav-shield-pill">
            <span className="beacon-dot"></span>
            <span>{t('nav_shield_active')}</span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language Selector Dropdown */}
          <LanguageDropdown />

          {/* Quick 112 Call link */}
          <a
            href="tel:112"
            className="btn btn-sm btn-danger"
            style={{ borderRadius: 'var(--radius-full)', fontWeight: 700, padding: '7px 12px' }}
            title="Immediate Police Emergency Dispatch (India: 112)"
          >
            <PhoneCall size={14} />
            <span className="hide-on-mobile">{t('btn_call_112')}</span>
            <span className="show-on-mobile">112</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-outline"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-full)' }}
            aria-label="Toggle light or dark theme"
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Cyber Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--color-violet)" />}
          </button>

          {/* Auth State Actions */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link to="/settings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 650,
                textDecoration: 'none'
              }}>
                <User size={16} color="var(--color-violet)" />
                <span className="hide-on-mobile" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="btn btn-sm btn-outline"
                style={{ padding: 8 }}
                title={t('btn_signout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                {t('btn_signin')}
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                {t('btn_register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

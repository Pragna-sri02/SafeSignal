import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertOctagon,
  Users,
  Compass,
  Sparkles,
  ShieldCheck,
  FolderLock,
  PhoneCall,
  Settings,
  Shield,
  Lock,
  Radio
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const navItems = [
  { to: '/dashboard', key: 'nav_dashboard', icon: LayoutDashboard },
  { to: '/physical-safety', key: 'nav_sos', icon: AlertOctagon, highlight: true },
  { to: '/trusted-contacts', key: 'nav_contacts', icon: Users },
  { to: '/journey-safety', key: 'nav_journey', icon: Compass },
  { to: '/digital-protection', key: 'nav_digital', icon: ShieldCheck },
  { to: '/assistant', key: 'nav_assistant', icon: Sparkles },
  { to: '/evidence', key: 'nav_evidence', icon: FolderLock },
  { to: '/help-directory', key: 'nav_help', icon: PhoneCall },
  { to: '/settings', key: 'nav_settings', icon: Settings },
]

export const Sidebar = () => {
  const { t } = useLanguage()

  return (
    <aside className="app-sidebar" style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="app-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px 14px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 8
        }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.09em' }}>
            {t('nav_hub')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.725rem', color: '#10b981', fontWeight: 700 }}>
            <span className="beacon-dot"></span> {t('nav_live')}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 750 : 550,
                textDecoration: 'none',
                color: isActive
                  ? (item.highlight ? 'var(--color-emergency-red)' : 'var(--color-violet)')
                  : 'var(--text-secondary)',
                backgroundColor: isActive
                  ? (item.highlight ? 'var(--color-emergency-light)' : 'var(--color-violet-light)')
                  : 'transparent',
                border: isActive
                  ? (item.highlight ? '1px solid rgba(225, 29, 72, 0.25)' : '1px solid rgba(124, 58, 237, 0.25)')
                  : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              <span>{t(item.key)}</span>
            </NavLink>
          )
        })}
      </div>

      {/* Security Shield Status Card */}
      <div className="app-sidebar-banner" style={{
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        fontSize: '0.825rem',
        marginTop: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} color="var(--color-teal)" />
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{t('shield_active')}</strong>
          </div>
          <span className="beacon-dot"></span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, fontSize: '0.785rem' }}>
          {t('shield_desc')}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 4, borderTop: '1px solid var(--border-color)' }}>
          <Lock size={12} />
          <span>{t('shield_encrypted')}</span>
        </div>
      </div>
    </aside>
  )
}

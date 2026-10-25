import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, AlertOctagon, Sparkles, Settings } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const MobileBottomNav = () => {
  const { t } = useLanguage()

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>{t('nav_dashboard') || 'Home'}</span>
      </NavLink>

      {/* 2. Trusted Contacts */}
      <NavLink
        to="/trusted-contacts"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Users size={20} />
        <span>{t('nav_contacts') || 'Circle'}</span>
      </NavLink>

      {/* 3. Center Elevated SOS Emergency Button */}
      <NavLink
        to="/physical-safety"
        className="mobile-sos-center-btn"
        title={t('btn_activate_sos') || 'Emergency SOS'}
      >
        <div className="mobile-sos-circle">
          <AlertOctagon size={26} color="#ffffff" />
        </div>
        <span className="mobile-sos-label">SOS</span>
      </NavLink>

      {/* 4. AI Assistant */}
      <NavLink
        to="/assistant"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Sparkles size={20} />
        <span>{t('nav_assistant') || 'AI Guard'}</span>
      </NavLink>

      {/* 5. Settings / More */}
      <NavLink
        to="/settings"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Settings size={20} />
        <span>{t('nav_settings') || 'Settings'}</span>
      </NavLink>
    </nav>
  )
}

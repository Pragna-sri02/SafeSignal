import React, { useState, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import { SosPanel } from '../components/SosPanel'
import { Users, PhoneCall, ShieldCheck, MapPin, AlertOctagon, MessageCircle, Send } from 'lucide-react'
import { api } from '../services/api'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export const PhysicalSafetyPage = () => {
  const { t } = useLanguage()
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    api.getContacts().then(setContacts).catch(() => {})
  }, [])

  const cleanPhone = (phone) => (phone ? phone.replace(/[^0-9+]/g, '') : '')

  const getWhatsAppSosLink = (phone, name) => {
    const digits = cleanPhone(phone)
    const fullNumber = digits.startsWith('+') ? digits.slice(1) : (digits.length === 10 ? '91' + digits : digits)
    const msg = `🚨 EMERGENCY ALERT FROM SAFESIGNAL 🚨\nHi ${name},\nI am activating emergency assistance. Please check on me immediately or dial 112!\nTime: ${new Date().toLocaleTimeString()}`
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`
  }

  const getSmsSosLink = (phone, name) => {
    const clean = cleanPhone(phone)
    const msg = `🚨 EMERGENCY ALERT: Hi ${name}, I am triggering emergency assistance from SafeSignal. Please call or reach out immediately! Time: ${new Date().toLocaleTimeString()}`
    return `sms:${clean}?body=${encodeURIComponent(msg)}`
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: t('nav_sos') }]} />

      <div className="page-header">
        <h1 className="page-title">{t('sos_title')}</h1>
        <p className="page-subtitle">
          {t('sos_subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Main SOS Panel */}
        <div style={{ gridColumn: 'span 2' }}>
          <SosPanel />
        </div>

        {/* Emergency Contacts Recipient Status */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--color-violet)" />
              {t('sos_recipients_title')}
            </h3>
            <Link to="/trusted-contacts" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {t('btn_manage') || 'Manage'}
            </Link>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            {t('sos_recipients_desc')}
          </p>

          {contacts.filter(c => c.is_sos_recipient).length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              {t('sos_recipients_empty')}
              <div style={{ marginTop: 8 }}>
                <Link to="/trusted-contacts" className="btn btn-sm btn-primary">
                  {t('sos_add_contacts_btn')}
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.filter(c => c.is_sos_recipient).map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <strong>{c.full_name}</strong>
                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                      {c.relationship} • {c.phone_number}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <a
                      href={getWhatsAppSosLink(c.phone_number, c.full_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ backgroundColor: '#25D366', color: '#ffffff', padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Send WhatsApp SOS Alert"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={getSmsSosLink(c.phone_number, c.full_name)}
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Send Direct SMS"
                    >
                      <Send size={13} color="var(--color-violet)" />
                      <span>SMS</span>
                    </a>

                    <a
                      href={`tel:${cleanPhone(c.phone_number)}`}
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 6px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                      title="Direct Call"
                    >
                      <PhoneCall size={13} color="var(--color-teal)" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rapid Police Dial */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneCall size={16} color="var(--color-emergency-red)" />
              {t('sos_police_title')}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
              {t('sos_police_desc')}
            </p>
            <a href="tel:112" className="btn btn-danger btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <PhoneCall size={16} />
              {t('sos_call_police')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

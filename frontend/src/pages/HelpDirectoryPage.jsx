import React, { useState, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  Clock,
  MapPin,
  HeartHandshake,
  Lock,
  Search,
  CheckCircle2
} from 'lucide-react'
import { api } from '../services/api'
import { LoadingState } from '../components/LoadingState'
import { useLanguage } from '../context/LanguageContext'
import { getLocalizedHelpResource } from '../i18n/helpDirectoryData'

export const HelpDirectoryPage = () => {
  const { t, language } = useLanguage()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.getHelpDirectory().then(data => {
      setResources(data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const filtered = resources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.phone_number && r.phone_number.includes(searchQuery))
  )

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: t('nav_help') }]} />

      <div className="page-header">
        <h1 className="page-title">{t('feat_help_title')}</h1>
        <p className="page-subtitle">
          {t('feat_help_desc')}
        </p>
      </div>

      {/* Emergency Notice Card */}
      <div className="alert-banner alert-danger" style={{ marginBottom: 28, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PhoneCall size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '1rem' }}>{t('help_danger_title')}</strong>
            <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
              {t('help_danger_desc')}
            </p>
          </div>
        </div>
        <a href="tel:112" className="btn btn-danger btn-lg" style={{ borderRadius: 'var(--radius-full)' }}>
          <PhoneCall size={18} /> {t('help_call_112_now')}
        </a>
      </div>

      {/* Search Input */}
      <div style={{ maxWidth: 420, marginBottom: 24, position: 'relative' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
        <input
          type="text"
          className="form-input"
          placeholder={t('help_search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {loading ? (
        <LoadingState message="Loading verified emergency directory..." />
      ) : (
        <div className="grid-2">
          {filtered.map((rawItem) => {
            const item = getLocalizedHelpResource(rawItem, language)
            return (
              <div key={item.id} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: item.is_emergency ? '4px solid var(--color-emergency-red)' : '4px solid var(--color-teal)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {item.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span className={`badge ${item.is_emergency ? 'badge-red' : 'badge-teal'}`} style={{ fontSize: '0.675rem' }}>
                          {item.category_label || item.category.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {item.coverage_area}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                    {item.purpose}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Clock size={14} color="var(--color-violet)" />
                      <span>{t('help_operating_hours')} <strong>{item.operating_hours}</strong></span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <strong>{t('help_usage')}</strong> {item.usage_instructions}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {item.phone_number && (
                    <a
                      href={`tel:${item.phone_number}`}
                      className={`btn ${item.is_emergency ? 'btn-danger' : 'btn-teal'} btn-sm`}
                      style={{ flex: 1 }}
                    >
                      <PhoneCall size={15} />
                      <span>{t('help_call_btn', { num: item.phone_number })}</span>
                    </a>
                  )}

                  {item.website_url && (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ flex: item.phone_number ? '0 0 auto' : '1' }}
                    >
                      <span>{t('help_visit_website')}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

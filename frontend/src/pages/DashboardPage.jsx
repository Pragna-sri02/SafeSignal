import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Compass,
  Sparkles,
  ShieldCheck,
  FolderLock,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { SosPanel } from '../components/SosPanel'
import { FeatureCard } from '../components/FeatureCard'
import { api } from '../services/api'

export const DashboardPage = () => {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [contacts, setContacts] = useState([])
  const [activeJourney, setActiveJourney] = useState(null)
  const [evidenceCount, setEvidenceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardMetrics()
  }, [])

  const loadDashboardMetrics = async () => {
    try {
      const [contactsData, journeyData, evidenceData] = await Promise.all([
        api.getContacts().catch(() => []),
        api.getActiveJourney().catch(() => null),
        api.getEvidence().catch(() => [])
      ])
      setContacts(contactsData || [])
      setActiveJourney(journeyData)
      setEvidenceCount(evidenceData?.length || 0)
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        <div>
          <h1 className="page-title">
            {t('dash_welcome')}, {displayName} 👋
          </h1>
          <p className="page-subtitle">
            {t('dash_subtitle')}
          </p>
        </div>
      </div>

      {/* Prominent Emergency SOS Card */}
      <div style={{ marginBottom: 32 }}>
        <SosPanel onIncidentCreated={() => loadDashboardMetrics()} />
      </div>

      {/* Real-time Safety Status Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {/* Contact Status */}
        <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-violet)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dash_trusted_circle')}</span>
            <Users size={18} color="var(--color-violet)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
            {contacts.length} {t('dash_contacts_suffix')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {contacts.filter(c => c.is_sos_recipient).length} {t('dash_sos_designated')}
          </p>
        </div>

        {/* Journey Status */}
        <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dash_journey_checkin')}</span>
            <Compass size={18} color="var(--color-teal)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
            {activeJourney ? t('dash_in_transit') : t('dash_inactive')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {activeJourney ? `${t('dash_commute_heading')} ${activeJourney.destination_name}` : t('dash_no_commute')}
          </p>
        </div>

        {/* Evidence Status */}
        <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-navy-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dash_evidence_vault')}</span>
            <FolderLock size={18} color="var(--color-navy-surface)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
            {evidenceCount}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {t('dash_incident_records')}
          </p>
        </div>

        {/* Rapid Police Dial */}
        <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-emergency-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dash_police_dispatch')}</span>
            <PhoneCall size={18} color="var(--color-emergency-red)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
            112 (ERSS)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {t('dash_pan_india_line')}
          </p>
        </div>
      </div>

      {/* Onboarding Alert if Contacts are 0 */}
      {contacts.length === 0 && !loading && (
        <div className="alert-banner alert-warning" style={{ marginBottom: 32 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>{t('dash_alert_contacts_title')}</strong>
            <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
              {t('dash_alert_contacts_desc')}
            </p>
          </div>
          <Link to="/trusted-contacts" className="btn btn-sm btn-primary">
            {t('btn_add_contact_now')}
          </Link>
        </div>
      )}

      {/* Feature Grid */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 18 }}>
        {t('dash_tools_title')}
      </h2>

      <div className="grid-3" style={{ marginBottom: 36 }}>
        <FeatureCard
          title={t('feat_digital_title')}
          description={t('feat_digital_desc')}
          icon={ShieldCheck}
          to="/digital-protection"
          badge={t('feat_digital_badge')}
          badgeType="teal"
          accentColor="var(--color-teal)"
        />

        <FeatureCard
          title={t('feat_assistant_title')}
          description={t('feat_assistant_desc')}
          icon={Sparkles}
          to="/assistant"
          badge={t('feat_assistant_badge')}
          badgeType="violet"
          accentColor="var(--color-violet)"
        />

        <FeatureCard
          title={t('feat_journey_title')}
          description={t('feat_journey_desc')}
          icon={Compass}
          to="/journey-safety"
          badge={activeJourney ? t('feat_journey_badge_active') : t('feat_journey_badge_ready')}
          badgeType={activeJourney ? "amber" : "neutral"}
          accentColor="var(--color-teal)"
        />

        <FeatureCard
          title={t('feat_contacts_title')}
          description={t('feat_contacts_desc')}
          icon={Users}
          to="/trusted-contacts"
          badge={`${contacts.length} ${t('dash_contacts_suffix')}`}
          badgeType="violet"
          accentColor="var(--color-violet)"
        />

        <FeatureCard
          title={t('feat_evidence_title')}
          description={t('feat_evidence_desc')}
          icon={FolderLock}
          to="/evidence"
          badge={t('feat_evidence_badge')}
          badgeType="neutral"
          accentColor="var(--color-navy-surface)"
        />

        <FeatureCard
          title={t('feat_help_title')}
          description={t('feat_help_desc')}
          icon={PhoneCall}
          to="/help-directory"
          badge={t('feat_help_badge')}
          badgeType="red"
          accentColor="var(--color-emergency-red)"
        />
      </div>
    </div>
  )
}

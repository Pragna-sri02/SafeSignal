import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  ExternalLink,
  CheckSquare,
  Square,
  FilePlus,
  Scale,
  Eye,
  Camera,
  FolderLock
} from 'lucide-react'
import { api } from '../services/api'
import { LoadingState } from '../components/LoadingState'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { getLocalizedCategory, getDigitalPageHeaders } from '../i18n/digitalPlaybooks'

export const DigitalProtectionPage = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { language } = useLanguage()
  const headers = getDigitalPageHeaders(language)
  const [categories, setCategories] = useState([])
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await api.getDigitalCategories()
      setCategories(data || [])
      if (data && data.length > 0) {
        setSelectedCatId(data[0].id)
      }
    } catch (err) {
      addToast('Could not load protection workflows: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const rawActiveCategory = categories.find(c => c.id === selectedCatId) || categories[0]
  const activeCategory = rawActiveCategory ? getLocalizedCategory(rawActiveCategory, language) : null

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }))
  }

  const handleRecordInEvidence = () => {
    if (!activeCategory) return
    navigate('/evidence', {
      state: {
        prefillCategory: activeCategory.id,
        prefillTitle: `Incident: ${activeCategory.title}`,
        prefillDescription: `Initial report based on SafeSignal guided playbook: ${activeCategory.title}.`
      }
    })
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: headers.page_title }]} />

      <div className="page-header">
        <h1 className="page-title">{headers.page_title}</h1>
        <p className="page-subtitle">
          {headers.page_subtitle}
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading cybersecurity playbooks..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 28, alignItems: 'start' }}>
          {/* Left Category Selector */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ padding: '8px 12px 14px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                {headers.incident_categories}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categories.map((rawCat) => {
                const cat = getLocalizedCategory(rawCat, language)
                const isSelected = cat.id === activeCategory?.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-teal-light)' : 'transparent',
                      color: isSelected ? 'var(--color-teal)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Guided Workflow Details */}
          {activeCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Category Summary Header */}
              <div className="card" style={{ borderTop: '4px solid var(--color-teal)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                      {activeCategory.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
                      {activeCategory.summary}
                    </p>
                  </div>
                  <button onClick={handleRecordInEvidence} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                    <FilePlus size={16} />
                    <span>{headers.log_evidence}</span>
                  </button>
                </div>

                {/* Immediate Considerations Banner */}
                <div className="alert-banner alert-warning" style={{ flexDirection: 'column', gap: 6, margin: '16px 0 0' }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                    <AlertTriangle size={16} /> {headers.immediate_considerations_title}
                  </strong>
                  <ul style={{ paddingLeft: 18, fontSize: '0.825rem', lineHeight: 1.5 }}>
                    {activeCategory.immediate_considerations.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step-by-Step Response Checklist */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckSquare size={20} color="var(--color-teal)" />
                  {headers.step_checklist_title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeCategory.response_checklist.map((step) => {
                    const isDone = Boolean(completedSteps[step.id])
                    return (
                      <div
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 14px',
                          backgroundColor: isDone ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          opacity: isDone ? 0.75 : 1,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ marginTop: 2, color: isDone ? 'var(--color-teal)' : 'var(--text-muted)' }}>
                          {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '0.925rem',
                            fontWeight: 700,
                            textDecoration: isDone ? 'line-through' : 'none',
                            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)'
                          }}>
                            {step.title}
                          </h4>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Evidence Preservation & Account Security Grid */}
              <div className="grid-2">
                {/* Evidence Preservation Tips */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={18} color="var(--color-violet)" />
                    {headers.evidence_rules_title}
                  </h4>
                  <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeCategory.evidence_preservation_tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Account Security & Privacy Actions */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={18} color="var(--color-teal)" />
                    {headers.security_privacy_title}
                  </h4>
                  <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeCategory.security_privacy_actions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Official Reporting Links & Legal References */}
              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
                      {headers.official_portals_title}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activeCategory.official_reporting_links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ justifyContent: 'space-between' }}
                        >
                          <span>{link.name}</span>
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scale size={16} color="var(--color-violet)" />
                      {headers.statutory_laws_title}
                    </h4>
                    <ul style={{ paddingLeft: 16, fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {activeCategory.statutory_legal_references.map((law, idx) => (
                        <li key={idx}><strong>{law}</strong></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

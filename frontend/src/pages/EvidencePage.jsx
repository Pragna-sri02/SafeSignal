import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldAlert,
  Clock,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { LoadingState } from '../components/LoadingState'

export const EvidencePage = () => {
  const location = useLocation()
  const { addToast } = useToast()
  const { t } = useLanguage()

  const categories = [
    { id: 'all', label: t('ev_cat_all') },
    { id: 'hacked_account', label: t('ev_cat_hacked') },
    { id: 'cyberbullying', label: t('ev_cat_cyberbullying') },
    { id: 'impersonation', label: t('ev_cat_impersonation') },
    { id: 'deepfake', label: t('ev_cat_deepfake') },
    { id: 'threats_blackmail', label: t('ev_cat_threats') },
    { id: 'privacy_breach', label: t('ev_cat_privacy') },
    { id: 'suspicious_activity', label: t('ev_cat_suspicious') },
    { id: 'image_misuse', label: t('ev_cat_image_misuse') },
    { id: 'other', label: t('ev_cat_other') }
  ]

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('hacked_account')
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16))
  const [platformName, setPlatformName] = useState('')
  const [suspectIdentifier, setSuspectIdentifier] = useState('')
  const [incidentUrl, setIncidentUrl] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [reportingStatus, setReportingStatus] = useState('evidence_preserved')
  const [formError, setFormError] = useState('')

  // Prefill from Digital Protection Page if navigated with state
  useEffect(() => {
    if (location.state?.prefillCategory) {
      setCategory(location.state.prefillCategory)
      setTitle(location.state.prefillTitle || '')
      setDescription(location.state.prefillDescription || '')
      setModalOpen(true)
    }
  }, [location.state])

  useEffect(() => {
    loadRecords()
  }, [selectedCategory, searchQuery])

  const loadRecords = async () => {
    try {
      const data = await api.getEvidence(selectedCategory, searchQuery)
      setRecords(data || [])
    } catch (err) {
      addToast('Error loading evidence records: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingRecord(null)
    setTitle('')
    setCategory('hacked_account')
    setIncidentDate(new Date().toISOString().slice(0, 16))
    setPlatformName('')
    setSuspectIdentifier('')
    setIncidentUrl('')
    setDescription('')
    setNotes('')
    setReportingStatus('evidence_preserved')
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (rec) => {
    setEditingRecord(rec)
    setTitle(rec.title)
    setCategory(rec.category)
    setIncidentDate(rec.incident_date ? new Date(rec.incident_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16))
    setPlatformName(rec.platform_name || '')
    setSuspectIdentifier(rec.suspect_identifier || '')
    setIncidentUrl(rec.incident_url || '')
    setDescription(rec.description)
    setNotes(rec.notes || '')
    setReportingStatus(rec.reporting_status)
    setFormError('')
    setModalOpen(true)
  }

  const handleSaveRecord = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim() || !description.trim()) {
      setFormError('Please enter both title and description.')
      return
    }

    const payload = {
      title: title.trim(),
      category,
      incident_date: new Date(incidentDate).toISOString(),
      platform_name: platformName.trim(),
      suspect_identifier: suspectIdentifier.trim(),
      incident_url: incidentUrl.trim(),
      description: description.trim(),
      notes: notes.trim(),
      reporting_status: reportingStatus
    }

    try {
      if (editingRecord) {
        const updated = await api.updateEvidence(editingRecord.id, payload)
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? updated : r))
        addToast('Incident record updated.', 'success')
      } else {
        const created = await api.createEvidence(payload)
        setRecords(prev => [created, ...prev])
        addToast('New evidence record logged in vault.', 'success')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message || 'Error saving record.')
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evidence record? This action cannot be undone.')) return
    try {
      await api.deleteEvidence(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      addToast('Evidence record deleted.', 'info')
    } catch (err) {
      addToast('Failed to delete: ' + err.message, 'danger')
    }
  }

  const handleDownloadSummary = async (recordId, recordTitle) => {
    try {
      const summaryText = await api.getEvidenceSummary(recordId)
      const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SafeSignal_Incident_${recordId.slice(0, 8)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addToast('Formal incident summary downloaded for police/cybercrime filing.', 'success')
    } catch (err) {
      addToast('Error downloading report: ' + err.message, 'danger')
    }
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: t('nav_evidence') }]} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderLock size={24} color="var(--color-navy-surface)" />
            {t('feat_evidence_title')}
          </h1>
          <p className="page-subtitle">
            {t('feat_evidence_desc')}
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>{t('btn_log_evidence')}</span>
        </button>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            className="form-input"
            placeholder={t('ev_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Evidence Record Grid */}
      {loading ? (
        <LoadingState message={t('ev_loading')} />
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FolderLock size={48} color="var(--color-navy-surface)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>{t('ev_no_records')}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 20px', fontSize: '0.875rem' }}>
            {t('ev_empty_desc')}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>{t('ev_create_first')}</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {records.map((rec) => {
            const catObj = categories.find(c => c.id === rec.category)
            const catLabel = catObj ? catObj.label : rec.category.replace('_', ' ')
            const statusLabel = t(`ev_status_${rec.reporting_status}`) || rec.reporting_status.replace('_', ' ')

            return (
              <div key={rec.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {rec.title}
                      </h3>
                      <span className="badge badge-violet">
                        {catLabel}
                      </span>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                        {t('ev_status_label')}: {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} />
                        {new Date(rec.incident_date).toLocaleString()}
                      </span>
                      {rec.platform_name && (
                        <span>{t('ev_platform_label')} <strong>{rec.platform_name}</strong></span>
                      )}
                      {rec.suspect_identifier && (
                        <span>{t('ev_suspect_label')} <strong style={{ color: 'var(--color-emergency-red)' }}>{rec.suspect_identifier}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleDownloadSummary(rec.id, rec.title)}
                      className="btn btn-sm btn-outline"
                      title={t('ev_export_summary')}
                    >
                      <Download size={14} />
                      <span>{t('ev_export_summary')}</span>
                    </button>
                    <button onClick={() => openEditModal(rec)} className="btn btn-sm btn-outline" aria-label={t('btn_edit') || 'Edit'}>
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="btn btn-sm btn-outline"
                      style={{ color: 'var(--color-emergency-red)' }}
                      aria-label={t('btn_delete') || 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rec.description}
                </p>

                {/* URLs and Notes */}
                {(rec.incident_url || rec.notes) && (
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rec.incident_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>URL:</strong>
                        <a href={rec.incident_url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                          {rec.incident_url} <ExternalLink size={12} style={{ display: 'inline' }} />
                        </a>
                      </div>
                    )}
                    {rec.notes && (
                      <div>
                        <strong>{t('ev_notes_label')}:</strong> {rec.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Record Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingRecord ? t('ev_modal_edit_title') : t('ev_modal_new_title')}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRecord}>
              <div className="form-group">
                <label className="form-label">{t('ev_title_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fake profile created with my photos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t('ev_category_label')}</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('ev_date_label')}</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t('ev_platform_service_label')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Instagram, WhatsApp, Gmail"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('ev_suspect_id_label')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. @suspect_user, +91 9xxxx"
                    value={suspectIdentifier}
                    onChange={(e) => setSuspectIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('ev_url_label')}</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://instagram.com/p/..."
                  value={incidentUrl}
                  onChange={(e) => setIncidentUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ev_desc_label')}</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what occurred, what was sent, and any threats made..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ev_notes_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Uncropped screenshot saved on desktop with system clock visible"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ev_status_label')}</label>
                <select
                  className="form-select"
                  value={reportingStatus}
                  onChange={(e) => setReportingStatus(e.target.value)}
                >
                  <option value="draft">{t('ev_status_draft')}</option>
                  <option value="evidence_preserved">{t('ev_status_evidence_preserved')}</option>
                  <option value="reported_to_platform">{t('ev_status_reported_to_platform')}</option>
                  <option value="reported_to_cybercrime">{t('ev_status_reported_to_cybercrime')}</option>
                  <option value="resolved">{t('ev_status_resolved')}</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  {t('btn_cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? t('ev_btn_update') : t('ev_btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

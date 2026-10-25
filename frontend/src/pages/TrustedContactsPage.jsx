import React, { useState, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  X,
  MessageCircle,
  PhoneCall
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { LoadingState } from '../components/LoadingState'

export const TrustedContactsPage = () => {
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [testingId, setTestingId] = useState(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [relationship, setRelationship] = useState('Family')
  const [email, setEmail] = useState('')
  const [isSosRecipient, setIsSosRecipient] = useState(true)
  const [notifyBySms, setNotifyBySms] = useState(true)
  const [notifyByCall, setNotifyByCall] = useState(false)
  const [formError, setFormError] = useState('')

  const cleanPhone = (phone) => (phone ? phone.replace(/[^0-9+]/g, '') : '')

  const getWhatsAppTestLink = (phone, name) => {
    const digits = cleanPhone(phone)
    const fullNumber = digits.startsWith('+') ? digits.slice(1) : (digits.length === 10 ? '91' + digits : digits)
    const msg = `SafeSignal Emergency Test: Hi ${name}, this is a test notification confirming you are my trusted emergency contact on SafeSignal.`
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await api.getContacts()
      setContacts(data || [])
    } catch (err) {
      addToast('Could not load trusted contacts: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingContact(null)
    setFullName('')
    setPhoneNumber('')
    setRelationship('Family')
    setEmail('')
    setIsSosRecipient(true)
    setNotifyBySms(true)
    setNotifyByCall(false)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (contact) => {
    setEditingContact(contact)
    setFullName(contact.full_name)
    setPhoneNumber(contact.phone_number)
    setRelationship(contact.relationship)
    setEmail(contact.email || '')
    setIsSosRecipient(contact.is_sos_recipient)
    setNotifyBySms(contact.notify_by_sms)
    setNotifyByCall(contact.notify_by_call)
    setFormError('')
    setModalOpen(true)
  }

  const handleSaveContact = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!fullName.trim() || !phoneNumber.trim()) {
      setFormError('Please enter contact name and telephone number.')
      return
    }

    const payload = {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      relationship,
      email: email.trim(),
      is_sos_recipient: isSosRecipient,
      notify_by_sms: notifyBySms,
      notify_by_call: notifyByCall
    }

    try {
      if (editingContact) {
        const updated = await api.updateContact(editingContact.id, payload)
        setContacts(prev => prev.map(c => c.id === editingContact.id ? updated : c))
        addToast('Contact updated successfully.', 'success')
      } else {
        const created = await api.createContact(payload)
        setContacts(prev => [...prev, created])
        addToast('Trusted contact added.', 'success')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message || 'Error saving contact.')
    }
  }

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to remove this trusted contact?')) return
    try {
      await api.deleteContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
      addToast('Contact removed from emergency circle.', 'info')
    } catch (err) {
      addToast('Error removing contact: ' + err.message, 'danger')
    }
  }

  const handleTestDemo = async (id, name) => {
    setTestingId(id)
    try {
      const res = await api.testDemoContact(id)
      addToast(res.message || `Demo test notification simulated for ${name}.`, 'success')
    } catch (err) {
      addToast('Failed to trigger test: ' + err.message, 'danger')
    } finally {
      setTestingId(null)
    }
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: t('nav_contacts') }]} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 className="page-title">{t('contacts_page_title')}</h1>
          <p className="page-subtitle">
            {t('contacts_page_subtitle')}
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <UserPlus size={18} />
          <span>{t('btn_add_contact')}</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading trusted contacts..." />
      ) : contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} color="var(--color-violet)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{t('contacts_empty_title')}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {t('contacts_empty_desc')}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <UserPlus size={18} />
            <span>{t('btn_add_contact')}</span>
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {contact.full_name}
                    </h3>
                    <span className="badge badge-neutral" style={{ marginTop: 4 }}>
                      {contact.relationship}
                    </span>
                  </div>
                  {contact.is_sos_recipient && (
                    <span className="badge badge-teal">
                      {t('badge_sos_active')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={15} color="var(--color-violet)" />
                    <span>{contact.phone_number}</span>
                  </div>
                  {contact.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={15} color="var(--color-violet)" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 8, fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  <span>SMS: {contact.notify_by_sms ? 'Enabled' : 'Disabled'}</span>
                  <span>•</span>
                  <span>Call: {contact.notify_by_call ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={getWhatsAppTestLink(contact.phone_number, contact.full_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ backgroundColor: '#25D366', color: '#ffffff', padding: '6px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Send a real WhatsApp verification test message"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${cleanPhone(contact.phone_number)}`}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '6px 8px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    title="Call contact directly"
                  >
                    <PhoneCall size={14} color="var(--color-teal)" />
                  </a>

                  <a
                    href={`sms:${cleanPhone(contact.phone_number)}?body=${encodeURIComponent(`🚨 SafeSignal Alert Test: Hi ${contact.full_name}, this is an alert confirmation from SafeSignal confirming you are my trusted emergency contact.`)}`}
                    onClick={() => {
                      addToast(`Opening device SMS to message ${contact.full_name}...`, 'info')
                      handleTestDemo(contact.id, contact.full_name)
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '6px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Send a real SMS to this contact"
                  >
                    <Send size={13} color="var(--color-violet)" />
                    <span>{t('sos_btn_sms') || 'Send SMS'}</span>
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEditModal(contact)}
                    className="btn btn-sm btn-outline"
                    aria-label="Edit contact"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="btn btn-sm btn-outline"
                    style={{ color: 'var(--color-emergency-red)' }}
                    aria-label="Delete contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingContact ? t('contacts_modal_edit') : t('contacts_modal_add')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact}>
              <div className="form-group">
                <label className="form-label" htmlFor="nameInput">{t('contacts_name_label')}</label>
                <input
                  id="nameInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sister, Mom, Friend"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phoneInput">{t('contacts_phone_label')}</label>
                <input
                  id="phoneInput"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="relationSelect">{t('contacts_relation_label')}</label>
                <select
                  id="relationSelect"
                  className="form-select"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="Family">Family Member</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Partner">Partner / Spouse</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emailInput">{t('contacts_email_label')}</label>
                <input
                  id="emailInput"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Notification Toggles */}
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isSosRecipient}
                    onChange={(e) => setIsSosRecipient(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-violet)' }}
                  />
                  <span>{t('contacts_sos_toggle')}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifyBySms}
                    onChange={(e) => setNotifyBySms(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-violet)' }}
                  />
                  <span>Dispatch SMS notification</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifyByCall}
                    onChange={(e) => setNotifyByCall(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-violet)' }}
                  />
                  <span>Initiate automated voice alert</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  {t('btn_cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContact ? t('btn_save') : t('btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

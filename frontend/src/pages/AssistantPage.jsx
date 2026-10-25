import React, { useState, useRef, useEffect } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'
import { SourceCitation } from '../components/SourceCitation'
import {
  Sparkles,
  Send,
  Trash2,
  AlertOctagon,
  PhoneCall,
  User,
  Bot,
  Loader2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

const LOCALIZED_SUGGESTIONS = {
  en: [
    "What should I do if my social media account is hacked?",
    "Someone created a fake profile using my photos. What should I do?",
    "How can I preserve evidence of online threats?",
    "I feel unsafe during my journey. What options do I have?",
    "Where can I report cybercrime in India?"
  ],
  te: [
    "నా సోషల్ మీడియా ఖాతా హ్యాక్ అయితే నేను ఏమి చేయాలి?",
    "నా ఫోటోలతో నకిలీ ప్రొఫైల్ క్రియేట్ చేశారు. నేను ఏమి చేయాలి?",
    "ఆన్‌లైన్ బెదిరింపుల సాక్ష్యాలను ఎలా భద్రపరచాలి?",
    "ప్రయాణంలో నాకు అభద్రతగా అనిపిస్తే ఏమి చేయాలి?",
    "భారతదేశంలో సైబర్ క్రైమ్ ఎక్కడ మరియు ఎలా రిపోర్ట్ చేయాలి?"
  ],
  hi: [
    "यदि मेरा सोशल मीडिया खाता हैक हो जाए तो मुझे क्या करना चाहिए?",
    "किसी ने मेरी तस्वीरों से फर्जी प्रोफाइल बना ली है। क्या करें?",
    "ऑनलाइन धमकियों के सबूत कैसे सुरक्षित रखें?",
    "यात्रा के दौरान असुरक्षित महसूस होने पर क्या विकल्प हैं?",
    "भारत में साइबर अपराध की रिपोर्ट कहां करें?"
  ],
  ta: [
    "எனது சமூக ஊடகக் கணக்கு ஹேக் செய்யப்பட்டால் என்ன செய்ய வேண்டும்?",
    "எனது புகைப்படங்களைப் பயன்படுத்தி போலி கணக்கு உருவாக்கப்பட்டுள்ளது. என்ன செய்வது?",
    "ஆன்லைன் அச்சுறுத்தல்களின் ஆதாரங்களை எவ்வாறு பாதுகாப்பது?",
    "பயணத்தின் போது பாதுகாப்பற்றதாக உணர்ந்தால் என்ன செய்ய வேண்டும்?",
    "இந்தியாவில் இணையக் குற்றங்களை எங்கு புகாரளிப்பது?"
  ]
}

export const AssistantPage = () => {
  const { addToast } = useToast()
  const { t, language } = useLanguage()
  const chips = LOCALIZED_SUGGESTIONS[language] || LOCALIZED_SUGGESTIONS.en
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello, I am SafeSignal AI, your grounded safety companion. I provide verified, practical guidance for physical security threats, hacked accounts, deepfakes, online harassment, and cybercrime reporting in India.\n\nHow can I support your safety today?",
      citations: [],
      is_urgent: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || loading) return

    const userMessageItem = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessageItem])
    setInputMessage('')
    setLoading(true)

    try {
      const response = await api.askAssistant(text, messages.slice(-4))
      const aiMessageItem = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations || [],
        is_urgent: response.is_urgent,
        suggested_actions: response.suggested_actions || [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessageItem])
    } catch (err) {
      addToast('Error generating AI response: ' + err.message, 'danger')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I encountered a communication issue connecting to the AI knowledge base. If you are in immediate danger, please dial 112 (Police) or 181 (Women Helpline) directly.",
          citations: [],
          is_urgent: true,
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation history cleared. How can I assist you with physical or digital safety?",
        citations: [],
        is_urgent: false,
        timestamp: new Date()
      }
    ])
    addToast('Conversation cleared.', 'info')
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height) - 40px)' }}>
      <Breadcrumb items={[{ label: t('nav_assistant') }]} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} color="var(--color-violet)" />
            {t('assistant_page_title')}
          </h1>
          <p className="page-subtitle">
            {t('assistant_page_subtitle')}
          </p>
        </div>

        <button onClick={handleClearChat} className="btn btn-sm btn-outline">
          <Trash2 size={14} />
          <span>{t('btn_clear')}</span>
        </button>
      </div>

      {/* Chat Container Card */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Messages Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 14,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.role === 'user' ? '80%' : '90%'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: msg.is_urgent ? 'var(--color-emergency-red)' : 'var(--color-violet)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.is_urgent ? <AlertOctagon size={20} /> : <Bot size={20} />}
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                backgroundColor: msg.role === 'user' ? 'var(--color-violet)' : 'var(--bg-subtle)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                borderTopRightRadius: msg.role === 'user' ? 4 : 'var(--radius-lg)',
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.6
              }}>
                {/* Urgent Safety Header if flagged */}
                {msg.is_urgent && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--color-emergency-red)',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    borderBottom: '1px solid rgba(225, 29, 72, 0.2)',
                    paddingBottom: 6
                  }}>
                    <PhoneCall size={16} />
                    <span>EMERGENCY DISPATCH RECOMMENDED: CALL 112</span>
                  </div>
                )}

                {/* Message Content */}
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.925rem' }}>
                  {msg.content}
                </div>

                {/* Grounded Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Trusted Reference Sources:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {msg.citations.map((cite, cIdx) => (
                        <SourceCitation key={cIdx} citation={cite} index={cIdx + 1} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--color-violet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 14, alignSelf: 'flex-start' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-violet)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} />
              </div>
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}>
                <Loader2 size={18} className="spin" color="var(--color-violet)" />
                <span>Searching verified safety documents and generating grounded response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Chips Bar */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('assistant_suggested_title')}:
          </span>
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.775rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
              disabled={loading}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          gap: 12
        }}>
          <input
            type="text"
            className="form-input"
            placeholder={t('assistant_placeholder')}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
            style={{ borderRadius: 'var(--radius-full)', padding: '12px 20px' }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            disabled={!inputMessage.trim() || loading}
            style={{ borderRadius: 'var(--radius-full)', padding: '12px 24px' }}
          >
            <Send size={18} />
            <span>{t('btn_send')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

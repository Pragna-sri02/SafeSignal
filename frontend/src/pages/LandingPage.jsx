import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  AlertOctagon,
  Sparkles,
  PhoneCall,
  Lock,
  Compass,
  ArrowRight,
  CheckCircle2,
  Users,
  EyeOff,
  Scale
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Emergency Hotline Header Banner */}
      <div style={{
        backgroundColor: '#15081c',
        color: '#ffffff',
        padding: '10px 24px',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PhoneCall size={14} color="#f43f5e" />
          <strong>Pan-India Emergency Helpline:</strong> <a href="tel:112" style={{ color: '#fda4af', fontWeight: 700 }}>112</a>
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>Women Helpline: <a href="tel:181" style={{ color: '#fbcfe8', fontWeight: 600 }}>181</a></span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>Cyber Crime Helpline: <a href="tel:1930" style={{ color: '#e9d5ff', fontWeight: 600 }}>1930</a></span>
      </div>

      {/* Hero Section */}
      <section style={{
        padding: '70px 24px 60px',
        background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.12), rgba(136, 19, 55, 0.08) 50%, transparent 80%), var(--bg-primary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            backgroundColor: 'var(--color-violet-light)',
            color: 'var(--color-violet)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 20
          }}>
            <Shield size={16} />
            <span>Unified Women's Safety & Digital Defense</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            lineHeight: 1.15
          }}>
            One Unified Platform for <br />
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a21caf 60%, #881337 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Physical Security & Digital Protection
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 36px'
          }}>
            SafeSignal combines instant SOS assistance and journey check-ins with cutting-edge defenses against hacked accounts, deepfakes, cyberbullying, and extortion—grounded by a trustworthy RAG AI assistant.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Go to Safety Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Get Protected Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Two Safety Pillars Section */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>The Two Pillars of Modern Safety</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 8 }}>
            Women today face threats both on physical streets and across digital platforms. SafeSignal solves both.
          </p>
        </div>

        <div className="grid-2">
          {/* Pillar 1: Physical Safety */}
          <div className="card" style={{ borderTop: '4px solid var(--color-emergency-red)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-emergency-light)',
                color: 'var(--color-emergency-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertOctagon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Physical Safety Module</h3>
                <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Emergency Ready</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.925rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-emergency-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Emergency SOS Dispatch:</strong> One-tap trigger with transparent GPS coordinates broadcast to trusted contacts.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-emergency-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Journey Monitoring & Check-ins:</strong> Set arrival times for late-night transit with automated missed check-in alerts.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-emergency-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Trusted Contact Circles:</strong> Manage family and friends who receive instant notifications during physical distress.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-emergency-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>112 Direct Dial:</strong> Instant one-touch integration to India's Emergency Response Support System.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Digital Safety */}
          <div className="card" style={{ borderTop: '4px solid var(--color-teal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal-light)',
                color: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Digital Protection Centre</h3>
                <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>Cyber Defense</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.925rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Hacked Account Recovery:</strong> Guided recovery protocols for Instagram, Google, and WhatsApp without paying scammers.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Deepfake & Image Morphing Defense:</strong> Cryptographic hash generation via StopNCII.org to preemptively block explicit misuse.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Evidence Organizer:</strong> Standardized, timestamped logging formatted to support Section 65B Indian Evidence Act reporting.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Harassment & Blackmail Playbooks:</strong> Step-by-step guidance for stalking, extortion, and cybercrime.gov.in complaint filing.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* RAG AI Assistant Feature Highlight */}
      <section style={{ backgroundColor: 'var(--bg-subtle)', padding: '60px 24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 450px' }}>
            <span className="badge badge-violet" style={{ marginBottom: 12 }}>
              <Sparkles size={12} /> Grounded AI Architecture
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 16 }}>
              AI Safety Guidance That Never Hallucinates Advice
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              Generic AI models can give dangerous, outdated, or fabricated legal advice. SafeSignal’s RAG assistant is grounded strictly in official documents from the Ministry of Home Affairs, CERT-In, Meta, and the Indian IT Act.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <Scale size={18} color="var(--color-violet)" />
                <span>Accurate statutory references (IPC 354D, IT Act 66C/66D/67A)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <EyeOff size={18} color="var(--color-violet)" />
                <span>Zero victim-blaming; empathetic trauma-informed tone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <PhoneCall size={18} color="var(--color-violet)" />
                <span>Immediate danger prioritization: elevates emergency 112 instantly</span>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 350px' }}>
            <div className="card" style={{ padding: 20, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Sparkles size={18} color="var(--color-violet)" />
                <strong style={{ fontSize: '0.95rem' }}>Ask SafeSignal Assistant:</strong>
              </div>
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                marginBottom: 10
              }}>
                "Someone created a fake profile with my photos and is blackmailing my friends. What should I do first?"
              </div>
              <div style={{
                backgroundColor: 'var(--color-teal-light)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                color: 'var(--color-navy-surface)',
                lineHeight: 1.45
              }}>
                <strong>SafeSignal Response:</strong><br />
                1. Do not pay extortion.<br />
                2. Copy the permanent browser URL.<br />
                3. Submit the Meta Impersonation Form with Government ID.<br />
                4. File report on <em>cybercrime.gov.in</em> under Section 66D IT Act.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '36px 24px',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            SafeSignal — AI-Powered Unified Women's Safety Platform
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Designed for personal physical defense and cyber safety. Always call 112 in life-threatening physical emergencies.
          </p>
        </div>
      </footer>
    </div>
  )
}

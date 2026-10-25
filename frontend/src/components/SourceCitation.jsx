import React from 'react'
import { ExternalLink, BookOpen, CheckCircle } from 'lucide-react'

export const SourceCitation = ({ citation, index }) => {
  if (!citation) return null

  return (
    <div style={{
      backgroundColor: 'var(--bg-subtle)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      fontSize: '0.85rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal-light)',
            color: 'var(--color-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.725rem',
            fontWeight: 800
          }}>
            {index || 1}
          </span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {citation.title}
          </strong>
        </div>
        <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
          <CheckCircle size={10} /> Verified
        </span>
      </div>

      <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
        Source: {citation.publisher}
      </div>

      {citation.snippet && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          backgroundColor: 'var(--bg-surface)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '2px solid var(--color-teal)'
        }}>
          "{citation.snippet}"
        </p>
      )}

      {citation.source_url && (
        <a
          href={citation.source_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-violet)',
            marginTop: 2
          }}
        >
          <span>Open Official Documentation</span>
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  )
}

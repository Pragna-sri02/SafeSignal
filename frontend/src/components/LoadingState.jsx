import React from 'react'
import { Loader2 } from 'lucide-react'

export const LoadingState = ({ message = 'Loading safety information...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: 14
    }}>
      <Loader2 size={32} color="var(--color-violet)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

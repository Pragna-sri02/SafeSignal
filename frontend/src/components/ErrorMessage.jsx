import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export const ErrorMessage = ({ message = 'An error occurred while loading data.', onRetry }) => {
  return (
    <div className="alert-banner alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={20} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-outline" style={{ borderColor: 'var(--color-emergency-red)', color: 'var(--color-emergency-red)' }}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  )
}

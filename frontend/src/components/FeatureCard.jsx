import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  to,
  badge,
  badgeType = 'violet',
  accentColor = 'var(--color-violet)',
  actionText = 'Open'
}) => {
  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor
          }}>
            {Icon && <Icon size={24} />}
          </div>
          {badge && (
            <span className={`badge badge-${badgeType}`}>
              {badge}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
          {description}
        </p>
      </div>

      <Link
        to={to}
        className="btn btn-outline btn-sm"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          borderColor: 'var(--border-color)',
          fontWeight: 600
        }}
      >
        <span>{actionText}</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionLink,
  onAction,
  icon
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--kf-surface)',
        border: '1px solid var(--kf-border)',
        borderRadius: 'var(--kf-radius-lg)',
        maxWidth: '640px',
        margin: '2rem auto'
      }}
    >
      <div style={{ color: 'var(--kf-primary)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
        {icon || <PackageOpen size={48} />}
      </div>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
        {{ ...{ title } }.title}
      </h3>
      <p style={{ color: 'var(--kf-text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="kf-btn kf-btn-primary kf-btn-lg">
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="kf-btn kf-btn-primary kf-btn-lg">
          {actionText}
        </button>
      )}
    </div>
  );
};

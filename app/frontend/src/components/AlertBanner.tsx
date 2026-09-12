import React from 'react';
import { AlertDto } from '../types';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertBannerProps {
  alert: AlertDto;
  onResolve?: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onResolve }) => {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  const borderColor = isCritical ? 'rgba(239, 68, 68, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)';
  const bgColor = isCritical ? 'rgba(239, 68, 68, 0.08)' : isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)';

  return (
    <div
      className="alert-banner-wrap"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        borderRadius: 'var(--kf-radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1rem'
      }}
    >
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flex: '1 1 280px' }}>
        <div style={{ marginTop: '2px' }}>
          {isCritical && <AlertCircle size={20} color="var(--kf-danger)" />}
          {isWarning && <AlertTriangle size={20} color="var(--kf-warning)" />}
          {!isCritical && !isWarning && <Info size={20} color="var(--kf-info)" />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>{alert.title}</span>
            {alert.bundleName && (
              <span style={{ fontSize: '0.75rem', color: 'var(--kf-primary)', background: 'var(--kf-primary-bg)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                {alert.bundleName}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--kf-text-muted)', lineHeight: 1.4 }}>
            {alert.message}
          </p>
        </div>
      </div>

      <div className="alert-banner-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {alert.bundleId && (
          <Link to={`/app/bundles/${alert.bundleId}`} className="kf-btn kf-btn-secondary kf-btn-sm">
            <span>Inspect Bundle</span>
            <ArrowRight size={14} />
          </Link>
        )}
        {onResolve && alert.status === 'active' && (
          <button
            onClick={() => onResolve(alert.id)}
            className="kf-btn kf-btn-sm"
            style={{ background: 'transparent', color: 'var(--kf-text-muted)', border: '1px solid var(--kf-border)' }}
            title="Mark alert as resolved"
          >
            <CheckCircle2 size={14} />
            <span>Resolve</span>
          </button>
        )}
      </div>
    </div>
  );
};

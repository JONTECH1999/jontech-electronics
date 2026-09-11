import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  trend,
  accentColor = 'var(--kf-primary)'
}) => {
  return (
    <div className="kpi-card" style={{ borderTopColor: accentColor }}>
      <span className="kpi-label">{label}</span>
      <div className="kpi-val">{value}</div>
      {(subtext || trend) && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--kf-text-dim)', marginTop: '0.25rem' }}>
          {trend && <span style={{ color: 'var(--kf-success)', fontWeight: 600, marginRight: '0.5rem' }}>{trend}</span>}
          {subtext}
        </div>
      )}
    </div>
  );
};

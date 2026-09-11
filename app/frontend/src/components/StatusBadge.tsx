import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'draft' | 'archived' | 'critical' | 'warning' | 'info' | 'resolved';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let badgeClass = 'kf-badge-neutral';
  let displayLabel = label || status.toUpperCase();

  switch (status) {
    case 'active':
      badgeClass = 'kf-badge-success';
      break;
    case 'draft':
      badgeClass = 'kf-badge-neutral';
      break;
    case 'archived':
      badgeClass = 'kf-badge-neutral';
      break;
    case 'critical':
      badgeClass = 'kf-badge-danger';
      break;
    case 'warning':
      badgeClass = 'kf-badge-warning';
      break;
    case 'info':
      badgeClass = 'kf-badge-info';
      break;
    case 'resolved':
      badgeClass = 'kf-badge-success';
      break;
  }

  return (
    <span className={`kf-badge ${badgeClass}`}>
      {displayLabel}
    </span>
  );
};

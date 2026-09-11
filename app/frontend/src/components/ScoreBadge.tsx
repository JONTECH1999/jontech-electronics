import React from 'react';

interface ScoreBadgeProps {
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
  if (score === undefined || score === null) {
    return <span className="score-pill score-tier-poor">—</span>;
  }

  const rounded = Math.round(score * 10) / 10;
  let tierClass = 'score-tier-poor';

  if (score >= 85) {
    tierClass = 'score-tier-top';
  } else if (score >= 70) {
    tierClass = 'score-tier-good';
  } else if (score >= 50) {
    tierClass = 'score-tier-fair';
  }

  const sizeStyles = {
    sm: { fontSize: '0.75rem', padding: '0.15rem 0.5rem' },
    md: { fontSize: '0.8125rem', padding: '0.25rem 0.625rem' },
    lg: { fontSize: '1.25rem', padding: '0.5rem 1.25rem', fontWeight: 800 }
  };

  return (
    <span className={`score-pill ${tierClass}`} style={sizeStyles[size]}>
      {rounded.toFixed(1)}/100
    </span>
  );
};

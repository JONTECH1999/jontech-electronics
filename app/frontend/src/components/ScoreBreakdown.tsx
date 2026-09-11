import React from 'react';
import { ScoreFactors } from '../types';

interface ScoreBreakdownProps {
  score?: ScoreFactors | null;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  if (!score) {
    return (
      <div style={{ color: 'var(--kf-text-dim)', fontSize: '0.875rem' }}>
        No score recorded yet. Click "Recalculate Score" to evaluate.
      </div>
    );
  }

  const factors = [
    {
      name: 'Sales Performance',
      weight: '35%',
      score: score.salesScore,
      desc: 'Based on historical co-orders and velocity across items'
    },
    {
      name: 'Product Compatibility',
      weight: '25%',
      score: score.compatibilityScore,
      desc: 'Category synergy and complementary functional overlap'
    },
    {
      name: 'Inventory Health',
      weight: '20%',
      score: score.inventoryScore,
      desc: 'Stock depth on every component to prevent fulfillment bottlenecks'
    },
    {
      name: 'Discount Efficiency',
      weight: '20%',
      score: score.discountScore,
      desc: 'Incentive strength balanced against gross merchant margin'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {factors.map((f, i) => {
        const pct = Math.min(100, Math.max(0, f.score));
        let barColor = 'var(--kf-success)';
        if (pct < 50) barColor = 'var(--kf-danger)';
        else if (pct < 75) barColor = 'var(--kf-warning)';
        else if (pct < 85) barColor = 'var(--kf-info)';

        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--kf-heading)' }}>{f.name}</span>
                <span style={{ color: 'var(--kf-text-dim)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>({f.weight} weight)</span>
              </div>
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: barColor }}>
                {f.score.toFixed(1)} / 100
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'var(--kf-bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--kf-border)' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: barColor,
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)', marginTop: '0.25rem' }}>
              {f.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};

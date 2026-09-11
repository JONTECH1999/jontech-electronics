import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '48px',
            borderRadius: 'var(--kf-radius-sm)',
            background: 'linear-gradient(90deg, var(--kf-surface-hover) 0%, var(--kf-border) 50%, var(--kf-surface-hover) 100%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

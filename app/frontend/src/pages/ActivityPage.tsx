import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ActivityLogDto } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Clock, PlusCircle, Edit3, Sparkles, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const loadActivity = () => {
    setLoading(true);
    api.getActivity(50)
      .then(res => setLogs(res.activity))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'bundle_created':
        return <PlusCircle size={18} color="var(--kf-success)" />;
      case 'bundle_updated':
        return <Edit3 size={18} color="var(--kf-info)" />;
      case 'score_recalculated':
        return <RefreshCw size={18} color="var(--kf-primary)" />;
      case 'ai_analysis_generated':
        return <Sparkles size={18} color="var(--kf-primary)" />;
      case 'inventory_alert_triggered':
        return <AlertTriangle size={18} color="var(--kf-warning)" />;
      default:
        return <Clock size={18} color="var(--kf-text-dim)" />;
    }
  };

  const filtered = logs.filter(log => {
    if (actionFilter === 'all') return true;
    return log.action === actionFilter;
  });

  return (
    <div>
      <div className="top-header">
        <div>
          <h1 className="page-title">Activity Audit Trail</h1>
          <p className="page-subtitle">
            Comprehensive audit log of bundle modifications, scoring triggers, AI analyses, and inventory alerts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'bundle_created', label: 'Creations' },
          { id: 'bundle_updated', label: 'Modifications' },
          { id: 'score_recalculated', label: 'Scoring Runs' },
          { id: 'ai_analysis_generated', label: 'AI Analyses' },
          { id: 'inventory_alert_triggered', label: 'Inventory Alerts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActionFilter(tab.id)}
            className={`kf-btn kf-btn-sm ${actionFilter === tab.id ? 'kf-btn-primary' : 'kf-btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Activities Found"
          description="No merchant actions recorded matching the selected filter."
        />
      ) : (
        <div className="kf-card" style={{ padding: '0.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((log, idx) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem 0',
                  borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--kf-border)'
                }}
              >
                <div style={{ marginTop: '3px' }}>
                  {getActionIcon(log.action)}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9375rem' }}>
                        {log.description}
                      </span>
                      {log.bundleName && log.bundleId && (
                        <Link
                          to={`/app/bundles/${log.bundleId}`}
                          style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--kf-primary)', textDecoration: 'underline' }}
                        >
                          View Bundle
                        </Link>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                      {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Metadata / Diffs */}
                  {log.metadata && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--kf-bg)', borderRadius: 'var(--kf-radius-sm)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--kf-text-muted)' }}>
                      {typeof log.metadata === 'object' ? JSON.stringify(log.metadata, null, 2) : log.metadata}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

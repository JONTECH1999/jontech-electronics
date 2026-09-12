import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ActivityLogDto } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Clock,
  PlusCircle,
  Edit3,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Layers,
  User,
  Package,
  Tag,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivityMetadata: React.FC<{ metadata: any }> = ({ metadata }) => {
  if (!metadata) return null;

  let parsed = metadata;
  if (typeof metadata === 'string') {
    try {
      parsed = JSON.parse(metadata);
    } catch {
      return (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--kf-text-muted)' }}>
          {metadata}
        </div>
      );
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return (
      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--kf-text-muted)' }}>
        {String(parsed)}
      </div>
    );
  }

  const badges: React.ReactNode[] = [];

  // 1. Author & Source pills
  if (parsed.author) {
    badges.push(
      <span key="author" className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <User size={12} color="var(--kf-text-muted)" />
        <span>By: <strong style={{ color: 'var(--kf-heading)' }}>{parsed.author}</strong></span>
      </span>
    );
  }
  if (parsed.source) {
    badges.push(
      <span key="source" className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <Layers size={12} color="var(--kf-text-muted)" />
        <span>Via: <strong style={{ color: 'var(--kf-heading)' }}>{parsed.source}</strong></span>
      </span>
    );
  }

  // 2. Item count & Discount
  if (parsed.itemCount !== undefined) {
    badges.push(
      <span key="itemCount" className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <Package size={12} color="var(--kf-primary)" />
        <span>{parsed.itemCount} items</span>
      </span>
    );
  }
  if (parsed.discountPercent !== undefined && typeof parsed.discountPercent !== 'object') {
    badges.push(
      <span key="discount" className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <Tag size={12} color="var(--kf-success)" />
        <span>{parsed.discountPercent}% off</span>
      </span>
    );
  }

  // 3. Score updates
  if (parsed.newScore !== undefined) {
    badges.push(
      <span key="newScore" className="kf-badge kf-badge-info" style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', gap: '0.35rem' }}>
        <RefreshCw size={12} />
        <span>Score: {parsed.previousScore != null ? `${parsed.previousScore} → ` : ''}{parsed.newScore}/100</span>
      </span>
    );
  }

  // 4. AI Model
  if (parsed.model) {
    const formattedModel = String(parsed.model).includes('claude-3-5-sonnet')
      ? 'Claude 3.5 Sonnet'
      : String(parsed.model);
    badges.push(
      <span key="model" className="kf-badge kf-badge-info" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <Cpu size={12} />
        <span>AI: {formattedModel}</span>
      </span>
    );
  }

  // 5. Stock warning
  if (parsed.stock !== undefined) {
    badges.push(
      <span key="stock" className="kf-badge kf-badge-warning" style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', gap: '0.35rem' }}>
        <AlertTriangle size={12} />
        <span>Stock: {parsed.stock} units left</span>
      </span>
    );
  }

  // 6. Deleted bundle reference
  if (parsed.deletedBundleName) {
    badges.push(
      <span key="deletedBundle" className="kf-badge kf-badge-danger" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem' }}>
        Deleted Bundle: {parsed.deletedBundleName}
      </span>
    );
  }

  // 7. Field diffs (e.g. from bundle_updated)
  const diffEntries = Object.entries(parsed).filter(([_, val]) =>
    val && typeof val === 'object' && 'from' in (val as any) && 'to' in (val as any)
  );

  diffEntries.forEach(([key, val]: [string, any]) => {
    const formatKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    badges.push(
      <span key={`diff-${key}`} className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', gap: '0.35rem' }}>
        <span>{formatKey}:</span>
        <span style={{ color: 'var(--kf-text-muted)' }}>{String(val.from)}</span>
        <ArrowRight size={10} color="var(--kf-primary)" />
        <span style={{ color: 'var(--kf-primary)', fontWeight: 600 }}>{String(val.to)}</span>
      </span>
    );
  });

  // 8. Other scalar keys not already matched
  const handledKeys = new Set([
    'author', 'source', 'itemCount', 'discountPercent', 'status',
    'previousScore', 'newScore', 'factors', 'model', 'severity',
    'stock', 'deletedBundleName', ...diffEntries.map(e => e[0])
  ]);
  const remainingEntries = Object.entries(parsed).filter(([key]) => !handledKeys.has(key));

  remainingEntries.forEach(([key, val]) => {
    if (val === null || val === undefined || typeof val === 'object') return;
    const formatKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    badges.push(
      <span key={`extra-${key}`} className="kf-badge kf-badge-neutral" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem' }}>
        {formatKey}: <strong style={{ color: 'var(--kf-heading)' }}>{String(val)}</strong>
      </span>
    );
  });

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {badges}
        </div>
      )}

      {/* Factor details if present */}
      {parsed.factors && typeof parsed.factors === 'object' && (
        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
          Factor breakdown: Sales {parsed.factors.sales ?? '-'} • Compat {parsed.factors.compatibility ?? '-'} • Inventory {parsed.factors.inventory ?? '-'} • Discount {parsed.factors.discount ?? '-'}
        </div>
      )}

      {/* Technical audit toggle for developers */}
      <details style={{ marginTop: '0.35rem', fontSize: '0.6875rem', color: 'var(--kf-text-dim)' }}>
        <summary style={{ cursor: 'pointer', opacity: 0.6, userSelect: 'none' }}>
          Technical payload
        </summary>
        <pre style={{
          marginTop: '0.25rem',
          padding: '0.35rem 0.5rem',
          background: 'var(--kf-bg)',
          borderRadius: 'var(--kf-radius-sm)',
          border: '1px solid var(--kf-border)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6875rem',
          color: 'var(--kf-text-muted)',
          overflowX: 'auto'
        }}>
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </details>
    </div>
  );
};

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
      case 'bundle_deleted':
        return <AlertTriangle size={18} color="var(--kf-danger)" />;
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
      <div className="filter-tabs-row" style={{ marginBottom: '1.5rem' }}>
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
                      <span style={{ fontWeight: 600, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>
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

                  {/* Merchant-Friendly Metadata / Diffs */}
                  <ActivityMetadata metadata={log.metadata} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

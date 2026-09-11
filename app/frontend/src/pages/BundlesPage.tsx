import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BundleDto } from '../types';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const BundlesPage: React.FC = () => {
  const [bundles, setBundles] = useState<BundleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadBundles = () => {
    setLoading(true);
    api.getBundles()
      .then(res => setBundles(res.bundles))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const filtered = bundles.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.targetCategory.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return b.status === 'active';
    if (statusFilter === 'draft') return b.status === 'draft';
    if (statusFilter === 'attention') return (b.activeAlertCount || 0) > 0 || ((b.score?.totalScore || 0) < 70);

    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="top-header">
        <div>
          <h1 className="page-title">Product Bundles</h1>
          <p className="page-subtitle">
            Manage your curated hardware packages, analyze score tiers, and mitigate stock risks.
          </p>
        </div>
        <Link to="/app/bundles/new" className="kf-btn kf-btn-primary">
          <Plus size={16} />
          <span>Create Bundle</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="kf-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', left: '0.875rem', transform: 'translateY(-50%)', color: 'var(--kf-text-dim)' }} />
            <input
              type="text"
              placeholder="Search bundles by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'all', label: 'All Bundles' },
              { id: 'active', label: 'Active' },
              { id: 'draft', label: 'Draft' },
              { id: 'attention', label: 'Attention Needed' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`kf-btn kf-btn-sm ${statusFilter === tab.id ? 'kf-btn-primary' : 'kf-btn-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bundles Table */}
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Bundles Found"
          description={search ? `No bundles found matching "${search}".` : "You haven't created any bundles yet."}
          actionText="Create Bundle"
          actionLink="/app/bundles/new"
        />
      ) : (
        <div className="kf-table-wrap">
          <table className="kf-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Rank</th>
                <th>Bundle Name</th>
                <th>Category</th>
                <th>Discount</th>
                <th>Products</th>
                <th>Score</th>
                <th>Stock Risk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bundle, index) => {
                const hasAlert = (bundle.activeAlertCount || 0) > 0;
                return (
                  <tr key={bundle.id}>
                    <td style={{ fontWeight: 800, color: index === 0 ? 'var(--kf-primary)' : 'var(--kf-text-dim)' }}>
                      #{bundle.rank || index + 1}
                    </td>
                    <td>
                      <Link to={`/app/bundles/${bundle.id}`} style={{ fontWeight: 600, color: 'var(--kf-heading)' }}>
                        {bundle.name}
                      </Link>
                      {bundle.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bundle.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="kf-badge kf-badge-neutral">{bundle.targetCategory}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--kf-primary)' }}>
                      {bundle.discountPercent}%
                    </td>
                    <td style={{ color: 'var(--kf-text-muted)' }}>
                      {bundle.items.length} items
                    </td>
                    <td>
                      <ScoreBadge score={bundle.score?.totalScore} size="sm" />
                    </td>
                    <td>
                      {hasAlert ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--kf-warning)', fontSize: '0.75rem', fontWeight: 700 }}>
                          <AlertTriangle size={14} />
                          <span>Low Inventory</span>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--kf-success)', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={14} />
                          <span>Healthy</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={bundle.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link to={`/app/bundles/${bundle.id}`} className="kf-btn kf-btn-secondary kf-btn-sm">
                          Inspect
                        </Link>
                        <Link to={`/app/bundles/${bundle.id}/edit`} className="kf-btn kf-btn-secondary kf-btn-sm">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { KpiCard } from '../components/KpiCard';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Plus, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    api.getDashboard()
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      loadData();
    } catch (err: any) {
      alert(`Failed to resolve alert: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="top-header">
          <div>
            <h1 className="page-title">Merchant Bundle Dashboard</h1>
            <p className="page-subtitle">Loading metrics, scores, and telemetry...</p>
          </div>
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Dashboard Unavailable"
        description={error || 'Unable to connect to KitFlow backend service.'}
        actionText="Retry Connection"
        onAction={loadData}
      />
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 className="page-title">Merchant Bundle Dashboard</h1>
          <p className="page-subtitle">
            Deterministic scoring, ranking, inventory risk mitigation, and AI recommendations.
          </p>
        </div>
        <Link to="/app/bundles/new" className="kf-btn kf-btn-primary">
          <Plus size={16} />
          <span>Create Bundle</span>
        </Link>
      </div>

      {/* Unambiguous Demo vs Live Store Banner */}
      <div style={{
        background: data.isDemoMode !== false ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        border: `1px solid ${data.isDemoMode !== false ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        borderRadius: 'var(--kf-radius)',
        padding: '0.75rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: data.isDemoMode !== false ? '#f59e0b' : '#10b981',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.6875rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {data.isDemoMode !== false ? 'DEMO DATA - Local Simulation' : 'LIVE SHOPIFY GRAPHQL'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: data.isDemoMode !== false ? '#f59e0b' : '#10b981' }}>
            {data.isDemoMode !== false
              ? 'Catalog products and order velocity are locally simulated for portfolio evaluation without requiring live store billing.'
              : 'Live store catalog and order frequency connected via Shopify Admin GraphQL API.'}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          API: {data.apiVersion || '2026-07'}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Bundles"
          value={data.kpis.totalBundles}
          subtext="Curated setups configured"
        />
        <KpiCard
          label="Active Bundles"
          value={data.kpis.activeBundles}
          subtext="Live on storefront"
          accentColor="var(--kf-success)"
        />
        <KpiCard
          label="Avg Bundle Score"
          value={`${data.kpis.averageScore}/100`}
          subtext="Deterministic quality rating"
          accentColor="var(--kf-info)"
        />
        <KpiCard
          label="Needs Attention"
          value={data.kpis.needingAttention}
          subtext="Inventory risks or low scores"
          accentColor={data.kpis.needingAttention > 0 ? 'var(--kf-warning)' : 'var(--kf-border)'}
        />
      </div>

      {/* Active Alerts Banner Area */}
      {data.recentAlerts.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--kf-heading)' }}>
              Active Inventory & Performance Alerts ({data.recentAlerts.length})
            </h2>
            <Link to="/app/alerts" style={{ fontSize: '0.8125rem', color: 'var(--kf-primary)' }}>
              View All Alerts →
            </Link>
          </div>
          {data.recentAlerts.map(alert => (
            <AlertBanner key={alert.id} alert={alert} onResolve={handleResolveAlert} />
          ))}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Top Scored Bundles */}
        <div className="kf-card">
          <div className="kf-card-header">
            <div>
              <h2 className="kf-card-title">Top Ranked Bundles</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
                Sorted by deterministic composite score (Sales 35%, Compat 25%, Stock 20%, Discount 20%)
              </p>
            </div>
            <Link to="/app/bundles" className="kf-btn kf-btn-secondary kf-btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {data.topBundles.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--kf-text-dim)' }}>
              No bundles created yet. Click "Create Bundle" to get started.
            </div>
          ) : (
            <div className="kf-table-wrap">
              <table className="kf-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Bundle Name</th>
                    <th>Items</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topBundles.map((bundle, index) => (
                    <tr key={bundle.id}>
                      <td style={{ fontWeight: 800, color: index === 0 ? 'var(--kf-primary)' : 'var(--kf-text-muted)' }}>
                        {bundle.rank || index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--kf-heading)' }}>{bundle.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                          {bundle.targetCategory} • {bundle.discountPercent}% off
                        </div>
                      </td>
                      <td style={{ color: 'var(--kf-text-muted)' }}>
                        {bundle.items.length} items
                      </td>
                      <td>
                        <ScoreBadge score={bundle.score?.totalScore} size="sm" />
                      </td>
                      <td>
                        <StatusBadge status={bundle.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/app/bundles/${bundle.id}`} className="kf-btn kf-btn-secondary kf-btn-sm">
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: AI Insights & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Insights Card */}
          <div className="kf-card" style={{ borderColor: 'rgba(180, 83, 9, 0.3)', background: 'radial-gradient(circle at 100% 0%, rgba(180, 83, 9, 0.06) 0%, var(--kf-surface) 60%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--kf-primary)" />
              <h2 className="kf-card-title">AI Strategic Recommendations</h2>
            </div>
            {data.aiInsights.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--kf-text-muted)' }}>
                No AI analyses generated yet. Open any bundle and click "Analyze with AI" to generate Claude recommendations.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.aiInsights.map((insight, idx) => (
                  <div key={idx} style={{ padding: '0.875rem', background: 'var(--kf-bg)', borderRadius: 'var(--kf-radius-sm)', border: '1px solid var(--kf-border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--kf-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {insight.bundleName}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                      {insight.summary}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--kf-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: 'var(--kf-success)', fontWeight: 700 }}>Action:</span>
                      <span>{insight.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="kf-card">
            <div className="kf-card-header">
              <h2 className="kf-card-title">Recent Activity</h2>
              <Link to="/app/activity" style={{ fontSize: '0.8125rem', color: 'var(--kf-primary)' }}>
                View Log →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recentActivity.slice(0, 5).map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.8125rem' }}>
                  <Clock size={16} color="var(--kf-text-dim)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'var(--kf-heading)', fontWeight: 500 }}>{act.description}</div>
                    <div style={{ color: 'var(--kf-text-dim)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                      {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

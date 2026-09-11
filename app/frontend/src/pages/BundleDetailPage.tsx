import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BundleDto } from '../types';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  ArrowLeft,
  Edit3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Trash2
} from 'lucide-react';

export const BundleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState<BundleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scoringLoading, setScoringLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadBundle = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.getBundle(id)
      .then(res => setBundle(res.bundle))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBundle();
  }, [id]);

  const handleRecalculate = async () => {
    if (!id) return;
    setScoringLoading(true);
    try {
      const res = await api.recalculateScore(id);
      setBundle(res.bundle);
    } catch (err: any) {
      alert(`Score recalculation failed: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleAnalyzeWithAi = async () => {
    if (!id) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.analyzeWithAi(id);
      setBundle(prev => prev ? { ...prev, latestAnalysis: res.analysis } : null);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !bundle) return;
    if (!window.confirm(`Are you sure you want to delete bundle "${bundle.name}"?`)) return;
    try {
      await api.deleteBundle(id);
      navigate('/app/bundles');
    } catch (err: any) {
      alert(`Failed to delete bundle: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <EmptyState
        title="Bundle Not Found"
        description={error || 'The requested bundle could not be found or you do not have permission to view it.'}
        actionText="Back to Bundles"
        actionLink="/app/bundles"
      />
    );
  }

  const rawSubtotal = bundle.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(rawSubtotal * (bundle.discountPercent / 100));
  const finalBundlePrice = rawSubtotal - discountAmount;

  return (
    <div>
      {/* Top Breadcrumb & Actions Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/app/bundles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--kf-text-muted)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          <span>Back to all bundles</span>
        </Link>
      </div>

      <div className="top-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">{bundle.name}</h1>
            <StatusBadge status={bundle.status} />
            <span className="kf-badge kf-badge-neutral">{bundle.targetCategory}</span>
          </div>
          <p className="page-subtitle">
            {bundle.description || 'No description provided.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={scoringLoading}
            className="kf-btn kf-btn-secondary"
          >
            <RefreshCw size={16} className={scoringLoading ? 'animate-spin' : ''} />
            <span>{scoringLoading ? 'Scoring...' : 'Recalculate Score'}</span>
          </button>

          <Link to={`/app/bundles/${bundle.id}/edit`} className="kf-btn kf-btn-secondary">
            <Edit3 size={16} />
            <span>Edit Bundle</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="kf-btn kf-btn-danger"
            title="Delete Bundle"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid: Left (Score & Telemetry) + Right (Items & AI Analyst) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Deterministic Scoring Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Score Hero Card */}
          <div className="kf-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="kf-card-title">Deterministic Bundle Score</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)', marginTop: '0.25rem' }}>
                  Authoritative mathematical rating (Engine v1.0)
                </div>
              </div>
              <ScoreBadge score={bundle.score?.totalScore} size="lg" />
            </div>

            <ScoreBreakdown score={bundle.score} />
          </div>

          {/* Pricing & Commercials Card */}
          <div className="kf-card">
            <h3 className="kf-card-title" style={{ marginBottom: '1rem' }}>Pricing & Margins</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--kf-text-muted)' }}>
                <span>Individual A La Carte Total:</span>
                <span style={{ color: 'var(--kf-text-dim)', textDecoration: 'line-through' }}>₱{rawSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--kf-text-muted)' }}>
                <span>Configured Bundle Discount:</span>
                <span style={{ color: 'var(--kf-primary)', fontWeight: 700 }}>{bundle.discountPercent}% (-₱{discountAmount.toLocaleString()})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--kf-border)', fontSize: '1.125rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--kf-heading)' }}>KitFlow Bundle Total:</span>
                <span style={{ fontWeight: 800, color: 'var(--kf-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ₱{finalBundlePrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Included Products & AI Analyst */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Included Products List */}
          <div className="kf-card">
            <div className="kf-card-header">
              <div>
                <h2 className="kf-card-title">Included Products ({bundle.items.length})</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
                  Hardware components synchronized with Shopify catalog
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bundle.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    background: 'var(--kf-bg)',
                    borderRadius: 'var(--kf-radius-sm)',
                    border: '1px solid var(--kf-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--kf-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kf-primary)' }}>
                      <Package size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>{item.productTitle}</div>
                      {item.variantTitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>{item.variantTitle}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--kf-heading)' }}>₱{item.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Bundle Analyst Card (Anthropic Claude Integration) */}
          <div
            className="kf-card"
            style={{
              border: '1px solid rgba(180, 83, 9, 0.3)',
              background: 'radial-gradient(circle at 95% 5%, rgba(180, 83, 9, 0.06) 0%, var(--kf-surface) 65%)'
            }}
          >
            <div className="kf-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Sparkles size={22} color="var(--kf-primary)" />
                <div>
                  <h2 className="kf-card-title">AI Bundle Analyst</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)', marginTop: '0.125rem' }}>
                    Powered by Anthropic Claude (Server-Side)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeWithAi}
                disabled={aiLoading}
                className="kf-btn kf-btn-primary kf-btn-sm"
              >
                <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
                <span>{aiLoading ? 'Analyzing...' : (bundle.latestAnalysis ? 'Re-Analyze with AI' : 'Analyze with AI')}</span>
              </button>
            </div>

            {aiError && (
              <div style={{ padding: '0.875rem', background: 'var(--kf-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--kf-radius-sm)', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--kf-danger)' }}>
                {aiError}
              </div>
            )}

            {bundle.latestAnalysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Executive Summary */}
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--kf-text-dim)', marginBottom: '0.35rem' }}>
                    Executive Summary
                  </h4>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--kf-heading)', lineHeight: 1.6 }}>
                    {bundle.latestAnalysis.summary}
                  </p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--kf-success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} />
                    <span>Key Strengths & Synergies</span>
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--kf-text-muted)' }}>
                    {bundle.latestAnalysis.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--kf-warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={15} />
                    <span>Identified Risks & Weaknesses</span>
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--kf-text-muted)' }}>
                    {bundle.latestAnalysis.risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--kf-primary)', marginBottom: '0.5rem' }}>
                    Recommended Actions
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--kf-text-muted)' }}>
                    {bundle.latestAnalysis.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Timestamp & Model note */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--kf-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                  <span>Model: {bundle.latestAnalysis.model || 'Anthropic Claude'}</span>
                  <span>
                    Generated: {bundle.latestAnalysis.generatedAt ? new Date(bundle.latestAnalysis.generatedAt).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--kf-text-muted)' }}>
                <Sparkles size={32} color="var(--kf-text-dim)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Click "Analyze with AI" to generate real-time actionable insights, risk identification, and inventory guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

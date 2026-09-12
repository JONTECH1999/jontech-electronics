import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Save, Sliders, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    scoringWeights: {
      salesWeight: 0.35,
      compatibilityWeight: 0.25,
      inventoryWeight: 0.20,
      discountWeight: 0.20
    },
    alertThresholds: {
      criticalStock: 2,
      warningStock: 5
    },
    aiPreferences: {
      model: 'claude-3-5-sonnet-20241022',
      autoAnalyzeOnCreate: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res.settings) setSettings(res.settings);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div>
          <h1 className="page-title">Engine Settings & Calibration</h1>
          <p className="page-subtitle">
            Configure scoring factor weights, inventory alert sensitivities, and AI model parameters.
          </p>
        </div>
      </div>

      {success && (
        <div style={{ padding: '0.875rem 1.25rem', background: 'var(--kf-success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--kf-radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kf-success)' }}>
          <CheckCircle2 size={18} />
          <span>Settings successfully updated! All new scoring evaluations will use these parameters.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
        {/* Scoring Factor Calibration */}
        <div className="kf-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sliders size={20} color="var(--kf-primary)" />
            <h2 className="kf-card-title">Deterministic Scoring Weights</h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--kf-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Adjust the weight percentage assigned to each deterministic metric. Total must equal 100%.
          </p>

          <div className="form-row-2col" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">
                Sales Performance Weight: {(settings.scoringWeights.salesWeight * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={settings.scoringWeights.salesWeight}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  scoringWeights: { ...prev.scoringWeights, salesWeight: parseFloat(e.target.value) }
                }))}
                style={{ width: '100%', accentColor: 'var(--kf-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Product Compatibility Weight: {(settings.scoringWeights.compatibilityWeight * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={settings.scoringWeights.compatibilityWeight}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  scoringWeights: { ...prev.scoringWeights, compatibilityWeight: parseFloat(e.target.value) }
                }))}
                style={{ width: '100%', accentColor: 'var(--kf-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Inventory Health Weight: {(settings.scoringWeights.inventoryWeight * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.40"
                step="0.05"
                value={settings.scoringWeights.inventoryWeight}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  scoringWeights: { ...prev.scoringWeights, inventoryWeight: parseFloat(e.target.value) }
                }))}
                style={{ width: '100%', accentColor: 'var(--kf-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Discount Efficiency Weight: {(settings.scoringWeights.discountWeight * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.40"
                step="0.05"
                value={settings.scoringWeights.discountWeight}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  scoringWeights: { ...prev.scoringWeights, discountWeight: parseFloat(e.target.value) }
                }))}
                style={{ width: '100%', accentColor: 'var(--kf-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="kf-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShieldAlert size={20} color="var(--kf-warning)" />
            <h2 className="kf-card-title">Inventory Risk Thresholds</h2>
          </div>

          <div className="form-row-2col" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Critical Stock Threshold (Units)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.alertThresholds.criticalStock}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  alertThresholds: { ...prev.alertThresholds, criticalStock: parseInt(e.target.value, 10) }
                }))}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                Fires a red Critical Alert when item stock falls to or below this level.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Warning Stock Threshold (Units)</label>
              <input
                type="number"
                min="2"
                max="20"
                value={settings.alertThresholds.warningStock}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  alertThresholds: { ...prev.alertThresholds, warningStock: parseInt(e.target.value, 10) }
                }))}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                Fires an amber Warning Alert when inventory is getting thin.
              </span>
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="kf-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Cpu size={20} color="var(--kf-info)" />
            <h2 className="kf-card-title">Anthropic AI Integration</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Target Model</label>
            <select
              value={settings.aiPreferences.model}
              onChange={e => setSettings(prev => ({
                ...prev,
                aiPreferences: { ...prev.aiPreferences, model: e.target.value }
              }))}
              className="form-select"
            >
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended - Deep Strategic Reasoning)</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast & Cost Efficient)</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={saving} className="kf-btn kf-btn-primary kf-btn-lg" style={{ alignSelf: 'flex-start' }}>
          <Save size={18} />
          <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
        </button>
      </form>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertDto } from '../types';
import { AlertBanner } from '../components/AlertBanner';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const loadAlerts = () => {
    setLoading(true);
    api.getAlerts(statusFilter === 'all' ? undefined : statusFilter)
      .then(res => setAlerts(res.alerts))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch (err: any) {
      alert(`Failed to resolve alert: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div>
          <h1 className="page-title">Inventory & Performance Alerts</h1>
          <p className="page-subtitle">
            Deterministic monitoring flags low inventory thresholds and fulfillment risks across all setups.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs-row" style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'active', label: 'Active Alerts' },
          { id: 'resolved', label: 'Resolved History' },
          { id: 'all', label: 'All Alerts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`kf-btn kf-btn-sm ${statusFilter === tab.id ? 'kf-btn-primary' : 'kf-btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={48} color="var(--kf-success)" />}
          title={statusFilter === 'active' ? "All Systems Healthy" : "No Alerts Found"}
          description={statusFilter === 'active'
            ? "None of your active product bundles have critical inventory bottlenecks or performance warnings."
            : "No alert records match the selected filter."}
        />
      ) : (
        <div>
          {alerts.map(alert => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onResolve={alert.status === 'active' ? handleResolve : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

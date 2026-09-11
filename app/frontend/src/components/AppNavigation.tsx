import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  History,
  AlertTriangle,
  Settings,
  ExternalLink,
  Cpu,
  Radio
} from 'lucide-react';
import { api } from '../services/api';

export const AppNavigation: React.FC = () => {
  const shopDomain = new URLSearchParams(window.location.search).get('shop') ||
    localStorage.getItem('kitflow_shop') ||
    'jontech-electronics.myshopify.com';

  const [session, setSession] = React.useState<{ isDemoMode: boolean; apiVersion: string } | null>(null);

  React.useEffect(() => {
    api.getSession()
      .then(res => setSession({ isDemoMode: res.isDemoMode, apiVersion: res.apiVersion }))
      .catch(() => setSession({ isDemoMode: true, apiVersion: '2026-07' }));
  }, []);

  const isDemo = session?.isDemoMode ?? true;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--kf-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kf-primary)' }}>
          <Cpu size={22} />
        </div>
        <div>
          <span className="sidebar-logo-text">KitFlow</span>
          <div style={{ fontSize: '0.6875rem', color: 'var(--kf-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            BUNDLE ENGINE
          </div>
        </div>
      </div>

      {/* Unambiguous Demo Mode vs Live Store Badge */}
      <div style={{
        margin: '1rem 0.75rem 0.5rem',
        padding: '0.625rem 0.875rem',
        background: isDemo ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        border: `1px solid ${isDemo ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
        borderRadius: 'var(--kf-radius-sm)',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{
            background: isDemo ? '#f59e0b' : '#10b981',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.5625rem',
            padding: '0.125rem 0.375rem',
            borderRadius: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isDemo ? 'DEMO DATA' : 'LIVE SHOPIFY'}
          </span>
          <span style={{ color: 'var(--kf-text-dim)', fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace' }}>
            v{session?.apiVersion || '2026-07'}
          </span>
        </div>
        <div style={{ color: isDemo ? '#f59e0b' : '#10b981', fontWeight: 600, fontSize: '0.6875rem', marginBottom: '0.125rem' }}>
          {isDemo ? 'Local Simulation Mode' : 'Connected via GraphQL'}
        </div>
        <div style={{ color: 'var(--kf-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.6875rem' }}>
          {shopDomain}
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/app"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/app/bundles"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>All Bundles</span>
        </NavLink>

        <NavLink
          to="/app/bundles/new"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <PlusCircle size={18} />
          <span>Create Bundle</span>
        </NavLink>

        <NavLink
          to="/app/alerts"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={18} />
          <span>Alerts & Risks</span>
        </NavLink>

        <NavLink
          to="/app/activity"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Activity Log</span>
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Engine Settings</span>
        </NavLink>
      </nav>

      <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--kf-border)' }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="kf-btn kf-btn-secondary kf-btn-sm"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>View JonTech Store</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};

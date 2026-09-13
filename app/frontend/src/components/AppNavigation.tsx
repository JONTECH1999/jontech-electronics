import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  History,
  AlertTriangle,
  Users,
  Settings,
  ExternalLink,
  Cpu,
  Menu,
  X
} from 'lucide-react';
import { api } from '../services/api';

export const AppNavigation: React.FC = () => {
  const shopDomain = new URLSearchParams(window.location.search).get('shop') ||
    localStorage.getItem('kitflow_shop') ||
    'jontech-electronics-xs08gbw3.myshopify.com';

  const [session, setSession] = useState<{ isDemoMode: boolean; apiVersion: string } | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  React.useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    api.getSession()
      .then(res => setSession({ isDemoMode: res.isDemoMode, apiVersion: res.apiVersion }))
      .catch(() => setSession({ isDemoMode: true, apiVersion: '2026-07' }));
  }, []);

  const isDemo = session?.isDemoMode ?? true;

  const navLinks = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/bundles', label: 'All Bundles', icon: Layers, end: false },
    { to: '/app/bundles/new', label: 'Create Bundle', icon: PlusCircle, end: false },
    { to: '/app/alerts', label: 'Alerts & Risks', icon: AlertTriangle, end: false },
    { to: '/app/customers', label: 'Customers', icon: Users, end: false },
    { to: '/app/activity', label: 'Activity Log', icon: History, end: false },
    { to: '/app/settings', label: 'Engine Settings', icon: Settings, end: false }
  ];

  return (
    <>
      {/* ========================================================
          1. MOBILE TOP APP BAR (Phones & Tablets <= 820px)
      ======================================================== */}
      <header className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--kf-primary-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--kf-primary)'
          }}>
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--kf-heading)', lineHeight: 1.1 }}>
              JonTech Electronics
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isDemo ? '#f59e0b' : '#10b981',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '0.625rem', color: isDemo ? '#b45309' : '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isDemo ? 'Simulation' : 'Live Shopify'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ========================================================
          2. MOBILE SLIDE-OUT DRAWER & BACKDROP
      ======================================================== */}
      {isMobileDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--kf-primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--kf-primary)'
                }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--kf-heading)' }}>
                    JonTech Electronics
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--kf-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                    EMBEDDED SHOPIFY APP
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="kf-btn kf-btn-sm"
                style={{ background: 'transparent', border: 'none', color: 'var(--kf-text-muted)', padding: '0.25rem' }}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Shop Context Badge in Drawer */}
            <div style={{
              margin: '0.875rem 1rem 0.5rem',
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
                  textTransform: 'uppercase'
                }}>
                  {isDemo ? 'DEMO DATA' : 'LIVE SHOPIFY'}
                </span>
                <span style={{ color: 'var(--kf-text-dim)', fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  v{session?.apiVersion || '2026-07'}
                </span>
              </div>
              <div style={{ color: isDemo ? '#b45309' : '#15803d', fontWeight: 600, fontSize: '0.6875rem' }}>
                {isDemo ? 'Local Simulation Mode' : 'Connected via GraphQL'}
              </div>
              <div style={{ color: 'var(--kf-text-muted)', fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shopDomain}
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="sidebar-nav" style={{ padding: '0.75rem 0.875rem' }}>
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    style={{ minHeight: '44px' }}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* External Links */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--kf-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <a
                href="https://admin.shopify.com/store/jontech-electronics-xs08gbw3/products"
                target="_blank"
                rel="noopener noreferrer"
                className="kf-btn kf-btn-secondary kf-btn-sm"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8125rem', minHeight: '42px' }}
              >
                <span>Shopify Admin Products</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://jontech-electronics-xs08gbw3.myshopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="kf-btn kf-btn-sm"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--kf-text-muted)', background: 'transparent', border: '1px dashed var(--kf-border)', minHeight: '42px' }}
              >
                <span>JonTech Storefront</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. DESKTOP PERMANENT SIDEBAR (Screens > 820px)
      ======================================================== */}
      <aside className="app-sidebar desktop-only">
        <div className="sidebar-logo">
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--kf-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kf-primary)', flexShrink: 0 }}>
            <Cpu size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-logo-text" style={{ fontSize: '1.0625rem', lineHeight: 1.2, fontWeight: 800 }}>
              JonTech Electronics
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--kf-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.04em', marginTop: '0.15rem' }}>
              EMBEDDED SHOPIFY APP
            </div>
          </div>
        </div>

        {/* Demo Mode vs Live Store Badge */}
        <div className="sidebar-status-card" style={{
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
          <div style={{ color: isDemo ? '#b45309' : '#15803d', fontWeight: 600, fontSize: '0.6875rem', marginBottom: '0.125rem' }}>
            {isDemo ? 'Local Simulation Mode' : 'Connected via GraphQL'}
          </div>
          <div style={{ color: 'var(--kf-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.6875rem' }}>
            {shopDomain}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ padding: '1rem 0.875rem', borderTop: '1px solid var(--kf-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://admin.shopify.com/store/jontech-electronics-xs08gbw3/products"
            target="_blank"
            rel="noopener noreferrer"
            className="kf-btn kf-btn-secondary kf-btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.75rem' }}
          >
            <span>Shopify Admin Products</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://jontech-electronics-xs08gbw3.myshopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="kf-btn kf-btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--kf-text-muted)', background: 'transparent', border: '1px dashed var(--kf-border)' }}
          >
            <span>JonTech Storefront</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </aside>

      {/* ========================================================
          4. MOBILE BOTTOM NAVIGATION BAR (Phones & Tablets <= 820px)
      ======================================================== */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/app"
          end
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/app/bundles"
          end
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <Layers size={20} />
          <span>Bundles</span>
        </NavLink>

        <NavLink
          to="/app/bundles/new"
          className={({ isActive }) => `mobile-bottom-tab mobile-bottom-tab-create ${isActive ? 'active' : ''}`}
          aria-label="Create New Bundle"
        >
          <div className="create-tab-icon">
            <PlusCircle size={22} />
          </div>
          <span>Create</span>
        </NavLink>

        <NavLink
          to="/app/alerts"
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={20} />
          <span>Alerts</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`mobile-bottom-tab ${isMobileDrawerOpen ? 'active' : ''}`}
          aria-label="Open More Options"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
};

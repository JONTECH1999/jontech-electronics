import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerDto } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  Search,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'buyers' | 'invited'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [source, setSource] = useState<'shopify' | 'simulation'>('simulation');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const shopDomain = new URLSearchParams(window.location.search).get('shop') ||
    localStorage.getItem('kitflow_shop') ||
    'jontech-electronics-xs08gbw3.myshopify.com';

  const loadCustomers = (query?: string) => {
    setLoading(true);
    setLoadError(null);
    api.getCustomers(query)
      .then(res => {
        setCustomers(res.customers);
        setSource(res.source);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setLoadError(err instanceof Error ? err.message : 'Unable to load customers from Shopify.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.syncCustomers();
      setCustomers(res.customers);
      setSource(res.source);
      setToastMessage(`✓ Synced ${res.totalCount} customers successfully from ${res.source === 'shopify' ? 'Shopify Admin API' : 'store simulation'}!`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`Error syncing: ${err.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterState === 'buyers') return c.ordersCount > 0;
    if (filterState === 'invited') return c.state === 'INVITED';

    return true;
  });

  // KPI Calculations
  const totalCustomers = customers.length;
  const activeBuyers = customers.filter(c => c.ordersCount > 0).length;
  const totalSpend = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgOrderValue = activeBuyers > 0 ? totalSpend / activeBuyers : 0;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{
          background: '#065f46',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9375rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="top-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Customers & Buyers</h1>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: source === 'shopify' ? '#dcfce7' : '#fef3c7',
              color: source === 'shopify' ? '#15803d' : '#b45309',
              border: `1px solid ${source === 'shopify' ? '#86efac' : '#fde68a'}`
            }}>
              {source === 'shopify' ? '● Live Shopify Admin API' : '● Simulation / Demo Mode'}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Track storefront buyer accounts, purchasing history, and hardware bundle affinities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="kf-btn"
            style={{
              background: 'var(--kf-surface)',
              border: '1px solid var(--kf-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: syncing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Shopify'}</span>
          </button>

          <a
            href={`https://admin.shopify.com/store/${shopDomain.replace('.myshopify.com', '')}/customers`}
            target="_blank"
            rel="noopener noreferrer"
            className="kf-btn kf-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Open Shopify Customers</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Info Notice: How Customer Accounts Flow */}
      <div className="kf-card" style={{
        background: 'linear-gradient(135deg, #faf7f2 0%, #f5eedf 100%)',
        borderColor: '#e7dec8',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#b45309',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#1c1917', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
              How Buyer Accounts & Storefront Registration Work
            </div>
            <div style={{ fontSize: '0.84rem', color: '#44403c', lineHeight: 1.55 }}>
              When buyers register on your storefront (via <code style={{ background: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #e2d9c7' }}>/account/register</code> or during checkout), Shopify securely manages their credentials and stores the official customer record in <strong>Shopify Admin &rarr; Customers</strong>. With Shopify Admin API's <code style={{ background: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #e2d9c7' }}>read_customers</code> scope enabled, KitFlow queries customer metrics to analyze hardware bundle purchase behavior.
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="kf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--kf-text-muted)', textTransform: 'uppercase' }}>Total Registered</span>
            <Users size={18} style={{ color: 'var(--kf-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--kf-heading)' }}>
            {loading ? '...' : totalCustomers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
            Storefront buyer accounts
          </div>
        </div>

        <div className="kf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--kf-text-muted)', textTransform: 'uppercase' }}>Active Purchasers</span>
            <ShoppingBag size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--kf-heading)' }}>
            {loading ? '...' : activeBuyers}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
            {totalCustomers > 0 ? `${Math.round((activeBuyers / totalCustomers) * 100)}% conversion rate` : '0%'}
          </div>
        </div>

        <div className="kf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--kf-text-muted)', textTransform: 'uppercase' }}>Total Buyer Spend</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>₱</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--kf-heading)' }}>
            {loading ? '...' : `₱${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
            Cumulative customer GMV
          </div>
        </div>

        <div className="kf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--kf-text-muted)', textTransform: 'uppercase' }}>Avg. Spend / Buyer</span>
            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--kf-heading)' }}>
            {loading ? '...' : `₱${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
            Per active customer
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="kf-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--kf-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by buyer name, email, city, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="kf-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`kf-btn ${filterState === 'all' ? 'kf-btn-primary' : ''}`}
              style={filterState !== 'all' ? { background: 'var(--kf-surface)', border: '1px solid var(--kf-border)' } : {}}
              onClick={() => setFilterState('all')}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              className={`kf-btn ${filterState === 'buyers' ? 'kf-btn-primary' : ''}`}
              style={filterState !== 'buyers' ? { background: 'var(--kf-surface)', border: '1px solid var(--kf-border)' } : {}}
              onClick={() => setFilterState('buyers')}
            >
              Buyers ({customers.filter(c => c.ordersCount > 0).length})
            </button>
            <button
              type="button"
              className={`kf-btn ${filterState === 'invited' ? 'kf-btn-primary' : ''}`}
              style={filterState !== 'invited' ? { background: 'var(--kf-surface)', border: '1px solid var(--kf-border)' } : {}}
              onClick={() => setFilterState('invited')}
            >
              Pending ({customers.filter(c => c.state === 'INVITED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : loadError ? (
        <div className="kf-card" role="alert" style={{ padding: '1.25rem', borderColor: '#fecaca', background: '#fff7f7' }}>
          <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.35rem' }}>Customer data could not be loaded</div>
          <div style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '1rem' }}>{loadError}</div>
          <button type="button" className="kf-btn" onClick={() => loadCustomers()} style={{ border: '1px solid #fecaca' }}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No customer accounts found"
          description={search ? `No customers matched "${search}". Try clearing your search filter.` : "No customer accounts registered yet on the storefront."}
          actionText="View All Customers"
          onAction={() => { setSearch(''); setFilterState('all'); }}
        />
      ) : (
        <div className="kf-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f6f0', borderBottom: '1px solid var(--kf-border)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer / Buyer</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivery Location</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Orders</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Spent</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Joined</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => {
                  const initials = (customer.firstName?.[0] || customer.displayName?.[0] || 'B').toUpperCase() +
                    (customer.lastName?.[0] || '').toUpperCase();

                  return (
                    <tr
                      key={customer.id}
                      style={{ borderBottom: '1px solid var(--kf-border)', transition: 'background 0.15s ease' }}
                      className="table-row-hover"
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#fef3c7',
                            color: '#b45309',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            flexShrink: 0,
                            border: '1px solid #fde68a'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>
                              {customer.displayName}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                              <Mail size={12} />
                              <span>{customer.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--kf-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} style={{ color: '#b45309', flexShrink: 0 }} />
                          <span>{customer.city || 'Metro Manila'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)', marginLeft: '1.2rem' }}>
                          {customer.country || 'Philippines'}
                        </div>
                      </td>

                      {/* Orders */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          background: customer.ordersCount > 0 ? '#ecfdf5' : '#f4f4f5',
                          color: customer.ordersCount > 0 ? '#047857' : '#71717a'
                        }}>
                          <ShoppingBag size={12} />
                          {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>
                          ₱{customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)' }}>
                          Lifetime GMV
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: customer.state === 'ENABLED' ? '#dcfce7' : '#fef9c3',
                          color: customer.state === 'ENABLED' ? '#15803d' : '#854d0e'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                          {customer.state === 'ENABLED' ? 'Active / Verified' : 'Registered'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--kf-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="kf-btn"
                            style={{
                              padding: '0.4rem 0.75rem',
                              fontSize: '0.8125rem',
                              background: 'var(--kf-surface)',
                              border: '1px solid var(--kf-border)'
                            }}
                          >
                            View Profile
                          </button>
                          <a
                            href={`https://admin.shopify.com/store/${shopDomain.replace('.myshopify.com', '')}/customers/${customer.numericId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kf-btn"
                            title="Open Customer Record in Shopify Admin"
                            style={{
                              padding: '0.4rem 0.6rem',
                              background: 'var(--kf-surface)',
                              border: '1px solid var(--kf-border)'
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '520px',
            height: '100%',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--kf-border)', paddingBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--kf-text-muted)', textTransform: 'uppercase' }}>Buyer Profile</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--kf-heading)', margin: '0.25rem 0' }}>{selectedCustomer.displayName}</h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)' }}>Shopify ID: {selectedCustomer.numericId}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--kf-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contact & Location Info */}
            <div className="kf-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--kf-heading)' }}>Contact & Delivery</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kf-text-muted)' }}>
                  <Mail size={15} style={{ color: '#b45309' }} />
                  <a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--kf-heading)', textDecoration: 'underline' }}>{selectedCustomer.email}</a>
                </div>
                {selectedCustomer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kf-text-muted)' }}>
                    <Phone size={15} style={{ color: '#b45309' }} />
                    <span style={{ color: 'var(--kf-heading)' }}>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kf-text-muted)' }}>
                  <MapPin size={15} style={{ color: '#b45309' }} />
                  <span style={{ color: 'var(--kf-heading)' }}>{selectedCustomer.city}, {selectedCustomer.province}, {selectedCustomer.country}</span>
                </div>
              </div>
            </div>

            {/* Order Metrics */}
            <div className="kf-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--kf-heading)' }}>Purchasing History</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#faf7f2', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)' }}>Total Orders</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--kf-heading)', marginTop: '0.2rem' }}>{selectedCustomer.ordersCount}</div>
                </div>
                <div style={{ background: '#faf7f2', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)' }}>Total Spend</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}>₱{selectedCustomer.totalSpent.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Buyer Tags */}
            {selectedCustomer.tags.length > 0 && (
              <div className="kf-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--kf-heading)' }}>Customer Segment Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedCustomer.tags.map(tag => (
                    <span key={tag} style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {source === 'simulation' && (<React.Fragment>
            {/* Recommended Hardware Bundle */}
            <div className="kf-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#faf7f2', border: '1px solid #e7dec8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.875rem', color: '#b45309', marginBottom: '0.35rem' }}>
                <Sparkles size={16} />
                <span>KitFlow AI Bundle Affinity</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#44403c', margin: '0 0 0.75rem' }}>
                Based on this customer's browsing and hardware profile, recommend:
              </p>
              <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2d9c7', fontWeight: 700, fontSize: '0.875rem', color: '#1c1917' }}>
                ⚡ ESP32 IoT Smart Weather & Telemetry Kit (₱1,105.00)
              </div>
            </div>
            </React.Fragment>)}

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://admin.shopify.com/store/${shopDomain.replace('.myshopify.com', '')}/customers/${selectedCustomer.numericId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kf-btn kf-btn-primary"
                style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>Edit Customer in Shopify Admin</span>
                <ExternalLink size={16} />
              </a>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="kf-btn"
                style={{ background: 'var(--kf-surface)', border: '1px solid var(--kf-border)' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { BundleItemDto } from '../types';
import { ProductSelectorModal } from '../components/ProductSelectorModal';
import { ArrowLeft, Plus, Trash2, Package, Save, CheckCircle2 } from 'lucide-react';

export const BundleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [targetCategory, setTargetCategory] = useState('Gaming');
  const [items, setItems] = useState<BundleItemDto[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      api.getBundle(id)
        .then(res => {
          const b = res.bundle;
          setName(b.name);
          setDescription(b.description || '');
          setStatus(b.status);
          setDiscountPercent(b.discountPercent);
          setTargetCategory(b.targetCategory || 'Gaming');
          setItems(b.items);
        })
        .catch(err => alert(`Failed to load bundle: ${err.message}`))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleAddItem = (newProduct: {
    shopifyProductId: string;
    shopifyVariantId?: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    quantity: number;
  }) => {
    setItems(prev => [...prev, newProduct]);
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: validQty } : item));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Bundle name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Bundle name must be at least 2 characters';
    }

    if (items.length === 0) {
      newErrors.items = 'You must include at least 1 product in the bundle';
    }

    if (discountPercent < 0 || discountPercent > 75) {
      newErrors.discountPercent = 'Discount percentage must be between 0% and 75%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      status,
      discountPercent: Number(discountPercent),
      targetCategory,
      items: items.map(i => ({
        shopifyProductId: i.shopifyProductId,
        shopifyVariantId: i.shopifyVariantId,
        productTitle: i.productTitle,
        variantTitle: i.variantTitle,
        price: i.price,
        quantity: i.quantity
      }))
    };

    try {
      if (isEditMode && id) {
        const res = await api.updateBundle(id, payload);
        navigate(`/app/bundles/${res.bundle.id}`);
      } else {
        const res = await api.createBundle(payload);
        navigate(`/app/bundles/${res.bundle.id}`);
      }
    } catch (err: any) {
      alert(`Error saving bundle: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const finalTotal = rawSubtotal - discountAmount;

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--kf-text-muted)' }}>Loading bundle details...</div>;
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={isEditMode ? `/app/bundles/${id}` : '/app/bundles'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--kf-text-muted)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
      </div>

      <div className="top-header">
        <div>
          <h1 className="page-title">{isEditMode ? `Edit "${name}"` : 'Create New Bundle'}</h1>
          <p className="page-subtitle">
            Configure items, discount strategy, and trigger automated deterministic scoring.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Form Details & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div className="kf-card">
            <h2 className="kf-card-title" style={{ marginBottom: '1.25rem' }}>Bundle Information</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="bundle-name">Bundle Title *</label>
              <input
                id="bundle-name"
                type="text"
                placeholder="e.g. Esports Battlestation Starter Pack"
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input"
              />
              {errors.name && <span style={{ color: 'var(--kf-danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bundle-desc">Merchant Description</label>
              <textarea
                id="bundle-desc"
                rows={3}
                placeholder="Explain the workflow, ergonomics, and target audience for this setup..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bundle-category">Target Category</label>
                <select
                  id="bundle-category"
                  value={targetCategory}
                  onChange={e => setTargetCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Gaming">Gaming Battlestation</option>
                  <option value="Work">Work & Productivity</option>
                  <option value="Study">Study & Campus</option>
                  <option value="Travel">Mobile Road Warrior</option>
                  <option value="General">General Technology</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bundle-status">Publish Status</label>
                <select
                  id="bundle-status"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="form-select"
                >
                  <option value="active">Active (Available on Storefront)</option>
                  <option value="draft">Draft (Private Testing)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Included Products Card */}
          <div className="kf-card">
            <div className="kf-card-header">
              <div>
                <h2 className="kf-card-title">Included Products ({items.length})</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
                  Select hardware components to bundle together.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="kf-btn kf-btn-secondary kf-btn-sm"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            {errors.items && (
              <div style={{ color: 'var(--kf-danger)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {errors.items}
              </div>
            )}

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--kf-border)', borderRadius: 'var(--kf-radius-sm)', color: 'var(--kf-text-dim)' }}>
                <Package size={32} style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>No products added yet.</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="kf-btn kf-btn-primary kf-btn-sm"
                >
                  Select from Shopify Catalog
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((item, index) => (
                  <div
                    key={index}
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
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9375rem' }}>{item.productTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--kf-text-dim)' }}>
                        ₱{item.price.toLocaleString()} each {item.variantTitle && `• ${item.variantTitle}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--kf-text-muted)' }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleQuantityChange(index, parseInt(e.target.value, 10))}
                          className="form-input"
                          style={{ width: '4rem', padding: '0.25rem 0.5rem', textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ fontWeight: 700, color: '#fff', minWidth: '70px', textAlign: 'right' }}>
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="kf-btn kf-btn-danger kf-btn-sm"
                        style={{ padding: '0.4rem' }}
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Live Score Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Discount & Margin Card */}
          <div className="kf-card">
            <h2 className="kf-card-title" style={{ marginBottom: '1rem' }}>Discount Strategy</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="bundle-discount">
                Bundle Discount (%): <span style={{ color: 'var(--kf-primary)' }}>{discountPercent}%</span>
              </label>
              <input
                id="bundle-discount"
                type="range"
                min="0"
                max="50"
                step="1"
                value={discountPercent}
                onChange={e => setDiscountPercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--kf-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--kf-text-dim)', marginTop: '0.25rem' }}>
                <span>0%</span>
                <span style={{ color: 'var(--kf-success)' }}>10-15% (Optimal)</span>
                <span>50%</span>
              </div>
            </div>

            <div style={{ background: 'var(--kf-bg)', padding: '1rem', borderRadius: 'var(--kf-radius-sm)', border: '1px solid var(--kf-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--kf-text-muted)' }}>
                <span>Original Subtotal:</span>
                <span style={{ color: '#fff' }}>₱{rawSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--kf-text-muted)' }}>
                <span>Customer Savings:</span>
                <span style={{ color: 'var(--kf-success)', fontWeight: 700 }}>-₱{discountAmount.toLocaleString()} ({discountPercent}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--kf-border)', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: 800 }}>
                <span style={{ color: '#fff' }}>Bundle Price:</span>
                <span style={{ color: 'var(--kf-primary)' }}>₱{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="kf-card">
            <button
              type="submit"
              disabled={submitting}
              className="kf-btn kf-btn-primary kf-btn-lg"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              <Save size={18} />
              <span>{submitting ? 'Saving & Scoring...' : (isEditMode ? 'Update Bundle' : 'Save & Score Bundle')}</span>
            </button>

            <Link
              to={isEditMode ? `/app/bundles/${id}` : '/app/bundles'}
              className="kf-btn kf-btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Product Selection Modal */}
      <ProductSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectProduct={handleAddItem}
        alreadySelectedIds={items.map(i => i.shopifyProductId)}
      />
    </div>
  );
};

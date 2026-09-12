import React, { useState, useEffect } from 'react';
import { ShopifyProductSummary } from '../types';
import { api } from '../services/api';
import { Search, X, Check, Package, AlertCircle } from 'lucide-react';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: {
    shopifyProductId: string;
    shopifyVariantId?: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    quantity: number;
  }) => void;
  alreadySelectedIds?: string[];
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  alreadySelectedIds = []
}) => {
  const [products, setProducts] = useState<ShopifyProductSummary[]>([]);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [apiVersion, setApiVersion] = useState<string>('2026-07');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      api.getShopifyProducts()
        .then(res => {
          setProducts(res.products);
          setIsDemoData(res.isDemoData ?? true);
          if (res.apiVersion) setApiVersion(res.apiVersion);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor.toLowerCase().includes(search.toLowerCase()) ||
    p.productType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop">
      <div className="kf-card modal-dialog">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--kf-heading)' }}>Select Shopify Products</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--kf-text-muted)', marginTop: '0.25rem' }}>
              Choose items from your catalog to include in this bundle setup.
            </p>
          </div>
          <button onClick={onClose} className="kf-btn kf-btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--kf-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Source Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.625rem',
          borderRadius: '4px',
          background: isDemoData ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isDemoData ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
          marginBottom: '1rem',
          fontSize: '0.75rem',
          alignSelf: 'flex-start'
        }}>
          <span style={{
            fontWeight: 800,
            fontSize: '0.625rem',
            color: isDemoData ? '#f59e0b' : '#10b981',
            textTransform: 'uppercase'
          }}>
            {isDemoData ? 'DEMO SIMULATION CATALOG' : 'LIVE SHOPIFY GRAPHQL'}
          </span>
          <span style={{ color: 'var(--kf-text-muted)' }}>
            {isDemoData ? 'Simulated JonTech Electronics Inventory' : `Queried via Admin API ${apiVersion}`}
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', left: '0.875rem', transform: 'translateY(-50%)', color: 'var(--kf-text-dim)' }} />
          <input
            type="text"
            placeholder="Search products by title, type, or vendor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            autoFocus
          />
        </div>

        {/* Product List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--kf-text-muted)' }}>
              Loading products from Shopify...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--kf-danger)', background: 'var(--kf-danger-bg)', borderRadius: 'var(--kf-radius-sm)' }}>
              <AlertCircle size={20} style={{ margin: '0 auto 0.5rem' }} />
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            products.length === 0 && !isDemoData ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--kf-text-muted)' }}>
                <Package size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: 'var(--kf-heading)', marginBottom: '0.25rem' }}>No products in your Shopify Store</div>
                <p style={{ fontSize: '0.8125rem', marginBottom: '1rem', color: 'var(--kf-text-muted)' }}>
                  Your live Shopify store (<code>jontech-electronics-xs08gbw3</code>) doesn't have any products created yet.
                </p>
                <a
                  href="https://admin.shopify.com/store/jontech-electronics-xs08gbw3/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kf-btn kf-btn-primary kf-btn-sm"
                  style={{ display: 'inline-flex' }}
                >
                  Create Products in Shopify Admin
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--kf-text-dim)' }}>
                No products found matching {search ? `"${search}"` : 'criteria'}.
              </div>
            )
          )}

          {!loading && !error && filtered.map(product => {
            const firstVariant = product.variants[0];
            const isAlreadyAdded = alreadySelectedIds.includes(product.id);
            const stock = firstVariant?.inventoryQuantity ?? 0;
            const isLowStock = stock <= 5;

            return (
              <div
                key={product.id}
                className="modal-product-item"
                style={{
                  border: '1px solid var(--kf-border)',
                  borderRadius: 'var(--kf-radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--kf-bg)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--kf-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kf-primary)' }}>
                    <Package size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--kf-heading)', fontSize: '0.9375rem' }}>{product.title}</div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--kf-text-dim)', marginTop: '0.25rem' }}>
                      <span>{product.vendor}</span>
                      <span>•</span>
                      <span>₱{firstVariant?.price?.toLocaleString() || 0}</span>
                      <span>•</span>
                      <span style={{ color: isLowStock ? 'var(--kf-warning)' : 'var(--kf-success)', fontWeight: 600 }}>
                        {stock} in stock
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAlreadyAdded}
                  onClick={() => {
                    onSelectProduct({
                      shopifyProductId: product.id,
                      shopifyVariantId: firstVariant?.id,
                      productTitle: product.title,
                      variantTitle: firstVariant?.title,
                      price: firstVariant?.price || 0,
                      quantity: 1
                    });
                    onClose();
                  }}
                  className={`kf-btn kf-btn-sm ${isAlreadyAdded ? 'kf-btn-secondary' : 'kf-btn-primary'}`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check size={14} />
                      <span>Added</span>
                    </>
                  ) : (
                    <span>Add to Bundle</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

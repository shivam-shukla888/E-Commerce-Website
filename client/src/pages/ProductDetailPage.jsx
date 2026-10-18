import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Check, ArrowLeft, Zap } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export function ProductDetailPage({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  isAdded = false,
  addedProductIds = new Set(),
  onViewProduct,
}) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [fullProduct, setFullProduct] = useState(product);

  useEffect(() => {
    async function loadFullDetails() {
      if (!product?.id) return;
      try {
        const res = await fetch(`/api/products/${product.id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setFullProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to load full product details', err);
      }
    }
    loadFullDetails();
    setQuantity(1);
  }, [product?.id]);

  if (!fullProduct) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p>No product selected.</p>
        <button className="btn btn-primary btn-sm" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Catalogue
        </button>
      </div>
    );
  }

  const isOutOfStock = fullProduct.stock_quantity <= 0;
  const isLowStock = fullProduct.stock_quantity > 0 && fullProduct.stock_quantity <= 5;
  const priceRupees = (fullProduct.price_paise / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const specsObj = typeof fullProduct.specs === 'object' ? fullProduct.specs : {};

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Back Button & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack} id="back-to-catalogue-btn">
            <ArrowLeft size={16} /> Back to Products
          </button>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {fullProduct.category_name || 'Catalogue'}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
            {fullProduct.name}
          </span>
        </div>

        {/* Product Main Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          marginBottom: '60px'
        }}>
          {/* Left: Imagery */}
          <div>
            <div className="glass-card" style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              height: '460px',
              position: 'relative'
            }}>
              <img
                src={fullProduct.image_url}
                alt={fullProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                {fullProduct.is_featured === 1 && (
                  <span className="badge badge-gold" style={{ marginRight: '8px' }}>Featured</span>
                )}
                {isOutOfStock ? (
                  <span className="badge badge-rose">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="badge badge-gold">Only {fullProduct.stock_quantity} Left</span>
                ) : (
                  <span className="badge badge-emerald">In Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details & Purchase Actions */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
              {fullProduct.category_name || 'Exclusive'}
            </span>

            <h1 style={{ fontSize: '2.25rem', lineHeight: 1.25, marginBottom: '16px' }}>
              {fullProduct.name}
            </h1>

            {/* Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={18}
                    style={{
                      fill: i < Math.floor(fullProduct.rating || 5) ? '#f59e0b' : 'none',
                      color: '#f59e0b',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {Number(fullProduct.rating || 4.8).toFixed(1)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ({fullProduct.review_count || 12} Verified Customer Reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  ₹{priceRupees}
                </span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem', fontWeight: 600 }}>
                  Inclusive of all taxes & free shipping
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Guaranteed safe checkout simulation. No real cards charged.
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              {fullProduct.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quantity:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px',
                }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px' }}
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 600 }}>
                    {quantity}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px' }}
                    disabled={quantity >= fullProduct.stock_quantity || isOutOfStock}
                    onClick={() => setQuantity(q => Math.min(fullProduct.stock_quantity, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                disabled={isOutOfStock}
                onClick={() => onAddToCart(fullProduct, quantity)}
                style={{
                  padding: '12px 28px',
                  flex: '1 1 200px',
                  borderColor: isAdded ? '#10b981' : undefined,
                  color: isAdded ? '#6ee7b7' : undefined,
                }}
                id="product-detail-add-cart-btn"
              >
                {isAdded ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                className="btn btn-gold"
                disabled={isOutOfStock}
                onClick={() => onBuyNow(fullProduct, quantity)}
                style={{ padding: '12px 24px' }}
                id="product-detail-buy-now-btn"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>

            {/* Quick Guarantees */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Truck size={18} style={{ color: '#6366f1' }} />
                <span>Fast 2-Day Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} />
                <span>2-Year Full Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={18} style={{ color: '#f59e0b' }} />
                <span>Easy 14-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Overview Tabs */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '60px' }}>
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'specs' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('specs')}
            >
              Technical Specifications
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Customer Reviews ({fullProduct.review_count || 12})
            </button>
          </div>

          {activeTab === 'specs' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.keys(specsObj).length > 0 ? (
                Object.entries(specsObj).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{key}</span>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{value}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Standard luxury grade components and premium craftsmanship.</p>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
                  {Number(fullProduct.rating || 4.8).toFixed(1)}
                </div>
                <div>
                  <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '4px' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={18} style={{ fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Based on {fullProduct.review_count || 12} verified owner experiences
                  </div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>Vikram S.</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>2 days ago</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Outstanding build quality! Exactly as described, packaging was immaculate and delivery arrived ahead of schedule.
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>Priya M.</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>1 week ago</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Exceptional performance. Premium feel in everyday use. Truly elevates my daily routine.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {fullProduct.related_products && fullProduct.related_products.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>You Might Also Love</h3>
            <div className="product-grid">
              {fullProduct.related_products.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                  isAdded={addedProductIds.has(rel.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

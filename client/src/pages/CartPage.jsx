import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag, ArrowLeft } from 'lucide-react';

export function CartPage({
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  onContinueShopping,
}) {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  const subtotalPaise = cart.reduce((sum, item) => sum + (item.price_paise * item.quantity), 0);
  const freeShippingThresholdPaise = 99900; // ₹999
  const isFreeShipping = subtotalPaise >= freeShippingThresholdPaise || subtotalPaise === 0;
  const shippingPaise = isFreeShipping ? 0 : 9900; // ₹99
  const discountPaise = Math.round((subtotalPaise * discountPercent) / 100);
  const taxableSubtotal = Math.max(0, subtotalPaise - discountPaise);
  const taxPaise = Math.round((taxableSubtotal * 18) / 100);
  const totalPaise = taxableSubtotal + shippingPaise + taxPaise;

  const formatINR = (paise) => {
    return (paise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const remainingForFreeShipping = Math.max(0, freeShippingThresholdPaise - subtotalPaise);
  const freeShippingProgress = Math.min(100, (subtotalPaise / freeShippingThresholdPaise) * 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'LUXE10' || code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponMessage({ type: 'success', text: '10% promotional discount applied!' });
    } else if (code === 'VIP20') {
      setDiscountPercent(20);
      setCouponMessage({ type: 'success', text: '20% VIP exclusive discount applied!' });
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid promo code. Try "LUXE10" or "WELCOME10"' });
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: '50px 30px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--primary)'
            }}>
              <ShoppingBag size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
              Looks like you haven't added anything to your cart yet. Explore our handcrafted collection of premium audio, technology, and essentials.
            </p>
            <button
              className="btn btn-primary"
              onClick={onContinueShopping}
              id="empty-cart-shop-btn"
            >
              Start Shopping &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Checkout Simulation</span>
            <h1 style={{ fontSize: '2.25rem' }}>Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h1>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onContinueShopping}>
            <ArrowLeft size={16} /> Continue Shopping
          </button>
        </div>

        {/* Free Shipping Progress Alert */}
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: isFreeShipping ? '#10b981' : '#6366f1' }} />
              {isFreeShipping ? (
                <span style={{ color: '#6ee7b7', fontWeight: 600 }}>Congratulations! You have unlocked FREE Express Delivery!</span>
              ) : (
                <span>Add <strong>₹{formatINR(remainingForFreeShipping)}</strong> more to get <strong>FREE Express Shipping</strong>!</span>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{Math.round(freeShippingProgress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: '100%',
              background: isFreeShipping ? '#10b981' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Main Grid: Left Items List, Right Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative',
                  flexWrap: 'wrap'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#0f172a',
                  flexShrink: 0
                }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.category_name || 'Item'}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ₹{formatINR(item.price_paise)} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px'
                }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px' }}
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px' }}
                    disabled={item.quantity >= item.stock_quantity}
                    onClick={() => onUpdateQuantity(item.id, Math.min(item.stock_quantity, item.quantity + 1))}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    ₹{formatINR(item.price_paise * item.quantity)}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  className="btn btn-danger btn-icon"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove from cart"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onClearCart}
                style={{ color: 'var(--accent-rose)' }}
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="glass-card" style={{ padding: '28px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon (e.g. LUXE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  id="coupon-code-input"
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </div>
              {couponMessage && (
                <div style={{
                  fontSize: '0.8rem',
                  marginTop: '6px',
                  color: couponMessage.type === 'success' ? '#6ee7b7' : '#fda4af'
                }}>
                  {couponMessage.text}
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{formatINR(subtotalPaise)}</span>
              </div>

              {discountPaise > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Discount ({discountPercent}%):</span>
                  <span>-₹{formatINR(discountPaise)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Shipping:</span>
                <span>
                  {shippingPaise === 0 ? (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
                  ) : (
                    `₹${formatINR(shippingPaise)}`
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST / Tax (18%):</span>
                <span style={{ fontWeight: 600 }}>₹{formatINR(taxPaise)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-glass)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'var(--font-display)'
              }}>
                <span>Total Amount:</span>
                <span>₹{formatINR(totalPaise)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '16px' }}
              onClick={() => onProceedCheckout({
                discountPercent,
                discountPaise,
                subtotalPaise,
                shippingPaise,
                taxPaise,
                totalPaise
              })}
              id="proceed-to-checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              <span>100% Secure Simulated Transaction Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

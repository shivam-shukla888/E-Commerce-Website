import React, { useState } from 'react';
import { ShieldAlert, CreditCard, QrCode, Banknote, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function CheckoutPage({
  cart = [],
  user = null,
  checkoutQuote = {},
  onBackToCart,
  onOrderSuccess,
  onRequireAuth,
}) {
  const [formData, setFormData] = useState({
    shippingName: user?.fullName || '',
    shippingEmail: user?.email || '',
    shippingPhone: user?.phone || '+91 98765 43210',
    shippingAddress: user?.address || 'Flat 402, Highline Residency, Bandra West',
    shippingCity: user?.city || 'Mumbai',
    shippingPostalCode: user?.postalCode || '400050',
    paymentMethod: 'simulated_card',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const subtotalPaise = cart.reduce((sum, item) => sum + (item.price_paise * item.quantity), 0);
  const isFreeShipping = subtotalPaise >= 99900;
  const shippingPaise = isFreeShipping ? 0 : 9900;
  const taxPaise = Math.round((subtotalPaise * 18) / 100);
  const totalPaise = subtotalPaise + shippingPaise + taxPaise;

  const formatINR = (paise) => {
    return (paise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      onRequireAuth('Please sign in or create an account to finalize your order.');
      return;
    }

    if (!formData.shippingName || !formData.shippingEmail || !formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('luxemart_token');
      
      const payload = {
        shippingName: formData.shippingName.trim(),
        shippingEmail: formData.shippingEmail.trim(),
        shippingPhone: formData.shippingPhone.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        shippingCity: formData.shippingCity.trim(),
        shippingPostalCode: formData.shippingPostalCode.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // Order created successfully
      onOrderSuccess(data.order);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during order submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBackToCart} id="checkout-back-cart-btn">
            <ArrowLeft size={16} /> Return to Cart
          </button>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Secure Simulated Checkout</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Verify shipping destination and select sandbox simulated payment.
            </p>
          </div>
        </div>

        {/* Sandbox Notice Banner */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <ShieldAlert size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#fcd34d', fontSize: '0.95rem' }}>
              Academic & Demonstration Environment Sandbox
            </div>
            <div style={{ color: '#fed7aa', fontSize: '0.85rem' }}>
              This e-commerce application simulates orders safely. <strong>Never</strong> provide real credit card numbers, CVVs, or actual banking OTPs.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '14px 18px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fda4af',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Left: Shipping & Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Shipping Address Card */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                  1. Shipping Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="shippingName"
                      required
                      value={formData.shippingName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aarav Sharma"
                      style={{ width: '100%' }}
                      id="shipping-name-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="shippingEmail"
                      required
                      value={formData.shippingEmail}
                      onChange={handleInputChange}
                      placeholder="name@domain.com"
                      style={{ width: '100%' }}
                      id="shipping-email-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="shippingPhone"
                    required
                    value={formData.shippingPhone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%' }}
                    id="shipping-phone-input"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Street Address & Apartment *
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    required
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="402, Lotus Tower, 14th Cross"
                    style={{ width: '100%' }}
                    id="shipping-address-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      City / Region *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      required
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      placeholder="Mumbai / Bengaluru / Delhi"
                      style={{ width: '100%' }}
                      id="shipping-city-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Postal PIN Code *
                    </label>
                    <input
                      type="text"
                      name="shippingPostalCode"
                      required
                      value={formData.shippingPostalCode}
                      onChange={handleInputChange}
                      placeholder="400050"
                      style={{ width: '100%' }}
                      id="shipping-pin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                  2. Simulated Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Card Simulation */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.paymentMethod === 'simulated_card' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: formData.paymentMethod === 'simulated_card' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="simulated_card"
                      checked={formData.paymentMethod === 'simulated_card'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <CreditCard size={22} style={{ color: '#6366f1' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Simulated Test Card (Sandbox)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Instant test approval without real transaction fees
                      </div>
                    </div>
                  </label>

                  {/* UPI Simulation */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.paymentMethod === 'simulated_upi' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: formData.paymentMethod === 'simulated_upi' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="simulated_upi"
                      checked={formData.paymentMethod === 'simulated_upi'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <QrCode size={22} style={{ color: '#10b981' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Simulated Instant UPI</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Google Pay / PhonePe / Paytm test sandbox
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.paymentMethod === 'cash_on_delivery' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: formData.paymentMethod === 'cash_on_delivery' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <Banknote size={22} style={{ color: '#f59e0b' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pay during simulated doorstep delivery
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Review & Confirmation */}
            <div className="glass-card" style={{ padding: '28px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto', marginBottom: '20px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={item.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600 }}>₹{formatINR(item.price_paise * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span>₹{formatINR(subtotalPaise)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping Fee:</span>
                  <span>{isFreeShipping ? <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span> : `₹${formatINR(shippingPaise)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST / Tax (18%):</span>
                  <span>₹{formatINR(taxPaise)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-glass)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: 'var(--font-display)'
                }}>
                  <span>Final Total:</span>
                  <span>₹{formatINR(totalPaise)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginBottom: '16px' }}
                id="place-order-submit-btn"
              >
                {loading ? 'Securing Order...' : 'Confirm & Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <Lock size={14} style={{ color: '#10b981' }} />
                <span>256-Bit SSL Encryption Simulation</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

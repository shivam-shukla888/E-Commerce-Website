import React from 'react';
import { CheckCircle2, PackageCheck, ArrowRight, Printer, Home, ShoppingBag } from 'lucide-react';

export function OrderConfirmationPage({ order, onContinueShopping, onViewOrders }) {
  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Order Confirmation</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>No active order found.</p>
        <button className="btn btn-primary" onClick={onContinueShopping}>Return to Home</button>
      </div>
    );
  }

  const formatINR = (paise) => {
    return (paise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const formattedDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : 'Just now';

  return (
    <div style={{ padding: '50px 0 100px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Success Header */}
        <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            <CheckCircle2 size={44} />
          </div>

          <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
            Simulated Order Confirmed
          </span>

          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>Thank You for Your Order!</h1>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto 24px' }}>
            Your simulated order <strong>#{order.order_number}</strong> has been received and verified. A notification has been sent to <strong>{order.shipping_email}</strong>.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.9rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>2 - 3 Business Days via Express</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Order Number</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{order.order_number}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Placed On</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{formattedDate}</div>
            </div>
            <div>
              <span className="badge badge-primary">{order.status || 'processing'}</span>
            </div>
          </div>

          {/* Purchased Items Table */}
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Purchased Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} &bull; Unit Price: ₹{formatINR(item.unit_price_paise)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#fff' }}>
                  ₹{formatINR(item.subtotal_paise)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.95rem',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '16px',
            marginBottom: '24px',
            maxWidth: '320px',
            marginLeft: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span>₹{formatINR(order.subtotal_paise)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Express Shipping:</span>
              <span>{order.shipping_fee_paise === 0 ? <span style={{ color: '#10b981' }}>FREE</span> : `₹${formatINR(order.shipping_fee_paise)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax (GST 18%):</span>
              <span>₹{formatINR(order.tax_paise)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '10px',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#fff'
            }}>
              <span>Total Paid:</span>
              <span>₹{formatINR(order.total_amount_paise)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: '#fff' }}>Shipping Destination</h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div><strong>{order.shipping_name}</strong> ({order.shipping_phone})</div>
              <div>{order.shipping_address}</div>
              <div>{order.shipping_city} - {order.shipping_postal_code}</div>
              <div>Payment Mode: <span style={{ color: '#fff', textTransform: 'capitalize' }}>{order.payment_method?.replace('_', ' ')}</span></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={18} /> Print Receipt
          </button>
          <button className="btn btn-secondary" onClick={onViewOrders} id="view-order-history-btn">
            <PackageCheck size={18} /> View Order History
          </button>
          <button className="btn btn-primary" onClick={onContinueShopping} id="confirmation-continue-shop-btn">
            <ShoppingBag size={18} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

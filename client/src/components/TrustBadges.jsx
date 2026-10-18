import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export function TrustBadges() {
  const perks = [
    {
      icon: <Truck size={28} style={{ color: '#6366f1' }} />,
      title: 'Free Express Shipping',
      desc: 'Complimentary expedited delivery on all orders over ₹999.',
    },
    {
      icon: <ShieldCheck size={28} style={{ color: '#10b981' }} />,
      title: 'Authenticity Guaranteed',
      desc: '100% genuine products sourced directly from verified authorized manufacturers.',
    },
    {
      icon: <RefreshCw size={28} style={{ color: '#f59e0b' }} />,
      title: 'Hassle-Free 14-Day Returns',
      desc: 'Instant doorstep pickup with zero restocking fees.',
    },
    {
      icon: <Headphones size={28} style={{ color: '#06b6d4' }} />,
      title: '24/7 Concierge Support',
      desc: 'Dedicated specialist assistance for audio and tech setup.',
    },
  ];

  return (
    <section style={{ padding: '20px 0' }}>
      <div className="container">
        <div className="trust-grid">
          {perks.map((p, idx) => (
            <div key={idx} className="glass-card trust-item">
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {p.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{p.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

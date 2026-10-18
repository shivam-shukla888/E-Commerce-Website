import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';

export function Hero({ onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-badge-pill">
              <Sparkles size={16} style={{ color: '#f59e0b' }} />
              <span>Autumn / Winter Luxury 2026 Collection</span>
            </div>
            
            <h1 className="hero-title">
              Engineered Elegance.<br />
              <span className="text-gradient">Designed for Pure Perfection.</span>
            </h1>

            <p className="hero-subtitle">
              Curated audio equipment, precision computing, artisan leatherware, and intelligent lifestyle essentials crafted for the discerning modern creator.
            </p>

            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap', marginBottom: '40px' }}>
              <button 
                className="btn btn-primary" 
                onClick={onExploreClick}
                style={{ padding: '14px 28px', fontSize: '1rem' }}
                id="hero-explore-btn"
              >
                <span>Explore Catalogue</span>
                <ArrowRight size={18} />
              </button>
              <a 
                href="#categories" 
                className="btn btn-secondary"
                style={{ padding: '14px 24px', fontSize: '1rem' }}
              >
                Browse Collections
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-8" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  15k+
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Orders</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  4.9 <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer Rating</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Original Products</div>
              </div>
            </div>
          </div>

          {/* Hero Showcase Card */}
          <div className="hero-card-showcase">
            <div className="hero-image-wrap">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80" 
                alt="Premium Wireless Headphones"
              />
              <div className="hero-floating-card">
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Zap size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Editor's Choice 2026</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Sony WH-1000XM5 Studio</div>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>₹29,990 • In Stock</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

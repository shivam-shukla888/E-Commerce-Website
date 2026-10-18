import React from 'react';
import { ShoppingBag, Heart, ShieldAlert, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          <div>
            <div className="brand-logo" style={{ marginBottom: '16px' }}>
              <div className="brand-icon">
                <ShoppingBag size={20} />
              </div>
              <span>Luxe<span style={{ color: '#818cf8' }}>Mart</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Redefining premium consumer commerce with uncompromising quality, authentic warranty, and state-of-the-art checkout experience.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#fcd34d'
            }}>
              <ShieldAlert size={14} />
              <span>Checkout Simulation Sandbox Mode</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px' }}>Departments</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><a href="#catalogue" className="nav-link">Electronics & Computing</a></li>
              <li><a href="#catalogue" className="nav-link">High-Fidelity Audio</a></li>
              <li><a href="#catalogue" className="nav-link">Designer Leather & Apparel</a></li>
              <li><a href="#catalogue" className="nav-link">Connected Smart Wearables</a></li>
              <li><a href="#catalogue" className="nav-link">Ergonomic Workspaces</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><a href="#account" className="nav-link">Track Your Order</a></li>
              <li><a href="#catalogue" className="nav-link">Shipping & Delivery Policies</a></li>
              <li><a href="#catalogue" className="nav-link">Easy 14-Day Returns</a></li>
              <li><a href="#catalogue" className="nav-link">Authenticity Guarantee</a></li>
              <li><a href="#catalogue" className="nav-link">Terms & Privacy</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px' }}>Stay Connected</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Subscribe for exclusive new releases and seasonal member previews.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{ flex: 1, padding: '10px 14px' }} 
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing to LuxeMart newsletter!');
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            &copy; 2026 LuxeMart E-Commerce Platform. Built with React, Vite, Node.js, and SQLite.
          </div>
          <div className="flex items-center gap-2">
            <span>Crafted with</span>
            <Heart size={14} style={{ color: '#f43f5e', fill: '#f43f5e' }} />
            <span>for perfection.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

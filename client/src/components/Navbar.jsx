import React, { useState } from 'react';
import { ShoppingBag, Search, User, Shield, Menu, X, ArrowRight, Heart } from 'lucide-react';

export function Navbar({ 
  cartCount = 0, 
  onNavigate, 
  currentPage = 'home', 
  user = null, 
  onOpenAuth, 
  onLogout,
  onSearch,
  searchQuery = ''
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page, param = null) => {
    onNavigate(page, param);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrap">
      <div className="container">
        <div className="navbar">
          {/* Brand Logo */}
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
            className="brand-logo"
            id="nav-brand-logo"
          >
            <div className="brand-icon">
              <ShoppingBag size={20} />
            </div>
            <span>Luxe<span style={{ color: '#818cf8' }}>Mart</span></span>
          </a>

          {/* Navigation links (Desktop) */}
          <nav className="nav-links" style={{ display: 'none', md: 'flex' }}>
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </a>
            <a 
              href="#catalogue" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue'); }} 
              className={`nav-link ${currentPage === 'catalogue' ? 'active' : ''}`}
            >
              Shop All
            </a>
            <a 
              href="#electronics" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'electronics' }); }} 
              className="nav-link"
            >
              Electronics
            </a>
            <a 
              href="#audio" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'audio-sound' }); }} 
              className="nav-link"
            >
              Audio
            </a>
            <a 
              href="#fashion" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'fashion-apparel' }); }} 
              className="nav-link"
            >
              Fashion
            </a>
          </nav>

          {/* Live Search Bar */}
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Search premium products..." 
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNav('catalogue');
              }}
              id="global-search-input"
            />
          </div>

          {/* Actions & User menu */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button 
              className="btn btn-secondary btn-icon cart-btn-indicator" 
              onClick={() => handleNav('cart')}
              title="Shopping Cart"
              id="header-cart-button"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleNav('admin')}
                    style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}
                    id="admin-dashboard-link"
                  >
                    <Shield size={16} /> Admin
                  </button>
                )}
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleNav('account')}
                  id="user-account-link"
                >
                  <User size={16} /> {user.fullName ? user.fullName.split(' ')[0] : 'Account'}
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={onLogout}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={onOpenAuth}
                id="header-login-btn"
              >
                <User size={16} /> Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex' }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            padding: '16px 0 24px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
              className="nav-link"
            >
              Home
            </a>
            <a 
              href="#catalogue" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue'); }} 
              className="nav-link"
            >
              Shop All Products
            </a>
            <a 
              href="#electronics" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'electronics' }); }} 
              className="nav-link"
            >
              Electronics & Gadgets
            </a>
            <a 
              href="#audio" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'audio-sound' }); }} 
              className="nav-link"
            >
              Audio & Sound
            </a>
            <a 
              href="#fashion" 
              onClick={(e) => { e.preventDefault(); handleNav('catalogue', { category: 'fashion-apparel' }); }} 
              className="nav-link"
            >
              Fashion & Apparel
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

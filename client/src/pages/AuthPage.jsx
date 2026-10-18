import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

export function AuthPage({ onAuthSuccess, onCancel, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setIsLogin(true);
      setFormData(prev => ({
        ...prev,
        email: 'admin@ecommerce.test',
        password: 'Admin@12345',
      }));
    } else {
      setIsLogin(true);
      setFormData(prev => ({
        ...prev,
        email: 'customer@ecommerce.test',
        password: 'Customer@12345',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email.trim(), password: formData.password }
        : {
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save token and user
      localStorage.setItem('luxemart_token', data.token);
      localStorage.setItem('luxemart_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-card" style={{ padding: '36px 30px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-glass)',
            marginBottom: '28px'
          }}>
            <button
              className="btn"
              onClick={() => { setIsLogin(true); setErrorMsg(null); }}
              style={{
                flex: 1,
                borderBottom: isLogin ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: 0,
                color: isLogin ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                padding: '12px 0'
              }}
              id="auth-tab-login"
            >
              Sign In
            </button>
            <button
              className="btn"
              onClick={() => { setIsLogin(false); setErrorMsg(null); }}
              style={{
                flex: 1,
                borderBottom: !isLogin ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: 0,
                color: !isLogin ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                padding: '12px 0'
              }}
              id="auth-tab-register"
            >
              Create Account
            </button>
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Join LuxeMart'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {isLogin ? 'Sign in to access your order history and account.' : 'Register for express checkout and order tracking.'}
          </p>

          {/* Quick Demo Logins Banner */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 600, marginBottom: '8px' }}>
              Instant Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoFill('customer')}
                style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                id="demo-login-customer-btn"
              >
                <User size={13} /> Demo Customer
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoFill('admin')}
                style={{ fontSize: '0.8rem', padding: '5px 10px', color: '#fcd34d' }}
                id="demo-login-admin-btn"
              >
                <Shield size={13} /> Demo Admin
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fda4af',
              fontSize: '0.875rem',
              marginBottom: '20px'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Sharma"
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  id="auth-email-input"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password {isLogin ? '*' : '(min 8 characters) *'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px' }}
                  id="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-dim)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Delivery Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address & Flat"
                      style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="400050"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: '1rem', marginBottom: '16px' }}
              id="auth-submit-btn"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In & Continue' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onCancel}
              >
                Cancel and Return
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

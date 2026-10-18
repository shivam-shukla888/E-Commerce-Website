import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Phone, Mail, Shield, Calendar, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

export function AccountPage({ user, onNavigate, onLogout, onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
  });
  const [updateMsg, setUpdateMsg] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem('luxemart_token');
      const res = await fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load user orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatINR = (paise) => {
    return (paise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg(null);
    try {
      const token = localStorage.getItem('luxemart_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('luxemart_user', JSON.stringify(data.user));
        setUpdateMsg({ type: 'success', text: 'Profile details saved successfully.' });
        setIsEditing(false);
      } else {
        setUpdateMsg({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>User Portal</span>
            <h1 style={{ fontSize: '2.25rem' }}>Welcome, {user?.fullName || 'Customer'}</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user?.role === 'admin' && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('admin')}
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}
              >
                <Shield size={16} /> Admin Dashboard
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Details & Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          marginBottom: '48px',
          alignItems: 'start'
        }}>
          {/* User Info Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Profile Details</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {updateMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                background: updateMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: updateMsg.type === 'success' ? '#6ee7b7' : '#fda4af'
              }}>
                {updateMsg.text}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Street Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PIN Code</label>
                    <input
                      type="text"
                      value={editForm.postalCode}
                      onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Name</span>
                    <span style={{ fontWeight: 600 }}>{user?.fullName || 'Aarav Sharma'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Email Address</span>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={18} style={{ color: user?.role === 'admin' ? '#f59e0b' : '#10b981' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Account Privilege</span>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-gold' : 'badge-emerald'}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Default Shipping Destination</span>
                    <span>{user?.address ? `${user.address}, ${user.city} - ${user.postalCode}` : 'Not set yet'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Account Activity KPI */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '20px' }}>Lifetime Store Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Orders</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{orders.length}</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Value</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{formatINR(orders.reduce((sum, o) => sum + o.total_amount_paise, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>Order History & Tracking</h2>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading your verified orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
              <Package size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Orders Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                You have not placed any orders yet. Discover our curated catalog today.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('catalogue')}>
                Explore Catalogue
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
                <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>#{order.order_number}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={`badge ${
                        order.status === 'delivered' ? 'badge-emerald' :
                        order.status === 'cancelled' ? 'badge-rose' :
                        'badge-gold'
                      }`}>
                        {order.status}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                        ₹{formatINR(order.total_amount_paise)}
                      </span>
                    </div>
                  </div>

                  {/* Items Summary in this order */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>&bull; {item.product_name} &times; {item.quantity}</span>
                        <span style={{ color: '#fff' }}>₹{formatINR(item.subtotal_paise)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    <span>Shipping To: {order.shipping_name}, {order.shipping_city}</span>
                    <span style={{ color: '#a5b4fc' }}>Payment: {order.payment_method?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

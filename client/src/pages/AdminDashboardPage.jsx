import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Package, DollarSign, ShoppingCart, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle, X } from 'lucide-react';

export function AdminDashboardPage({ user, onBackToStore }) {
  const [activeTab, setActiveTab] = useState('products');
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    priceRupees: '',
    categoryId: '1',
    stockQuantity: '10',
    imageUrl: '',
    isFeatured: false,
  });

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('luxemart_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [metricsRes, prodsRes, ordersRes, catsRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }).then(r => r.json()),
        fetch('/api/products?limit=100').then(r => r.json()),
        fetch('/api/admin/orders', { headers }).then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (prodsRes.success) setProducts(prodsRes.products || []);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
      showToast('Failed to load admin resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const formatINR = (paise) => {
    return (paise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('luxemart_token');
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to ${newStatus}.`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustStock = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const token = localStorage.getItem('luxemart_token');
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newStock } : p));
        showToast('Stock inventory updated.');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('luxemart_token');
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('Product deleted successfully.');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('luxemart_token');
      const pricePaise = Math.round(Number(productForm.priceRupees) * 100);

      const payload = {
        name: productForm.name,
        description: productForm.description,
        pricePaise,
        categoryId: parseInt(productForm.categoryId, 10),
        stockQuantity: parseInt(productForm.stockQuantity, 10),
        imageUrl: productForm.imageUrl,
        isFeatured: productForm.isFeatured ? 1 : 0,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingProduct ? 'Product updated.' : 'Product created.');
        setShowProductModal(false);
        setEditingProduct(null);
        loadAdminData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      priceRupees: '',
      categoryId: categories[0]?.id || '1',
      stockQuantity: '15',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
    });
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      priceRupees: (p.price_paise / 100).toString(),
      categoryId: p.category_id.toString(),
      stockQuantity: p.stock_quantity.toString(),
      imageUrl: p.image_url,
      isFeatured: p.is_featured === 1,
    });
    setShowProductModal(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredOrders = orders.filter(o => 
    statusFilter === 'all' || o.status === statusFilter
  );

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 999,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: toastMessage.type === 'error' ? '#f43f5e' : '#10b981',
            color: '#fff',
            fontWeight: 600,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-gold">
                <Shield size={14} /> Root Administrator Access
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem' }}>Store Management Console</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadAdminData}>
              <RefreshCw size={16} /> Refresh Metrics
            </button>
            <button className="btn btn-primary btn-sm" onClick={onBackToStore}>
              <ArrowLeft size={16} /> Storefront
            </button>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Store Revenue</span>
              <DollarSign size={20} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {metrics ? metrics.totalRevenueFormatted : '₹0.00'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginTop: '4px' }}>Across active orders</div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders</span>
              <ShoppingCart size={20} style={{ color: '#6366f1' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {metrics ? metrics.totalOrders : '0'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '4px' }}>All-time customer checkouts</div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Products</span>
              <Package size={20} style={{ color: '#06b6d4' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {products.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#67e8f9', marginTop: '4px' }}>Catalog listings</div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Low Stock Items</span>
              <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
              {metrics ? metrics.lowStockCount : '0'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fcd34d', marginTop: '4px' }}>Items with &le; 5 units</div>
          </div>
        </div>

        {/* Management Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '32px' }}>
          <button
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('products')}
            id="admin-tab-products"
          >
            <Package size={16} /> Products & Inventory ({products.length})
          </button>
          <button
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('orders')}
            id="admin-tab-orders"
          >
            <ShoppingCart size={16} /> Customer Orders ({orders.length})
          </button>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <input
                type="text"
                placeholder="Search catalog products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ minWidth: '280px' }}
                id="admin-product-search"
              />
              <button className="btn btn-primary btn-sm" onClick={openCreateModal} id="admin-add-product-btn">
                <Plus size={16} /> Add New Product
              </button>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 20px' }}>Product</th>
                    <th style={{ padding: '16px 20px' }}>Category</th>
                    <th style={{ padding: '16px 20px' }}>Price</th>
                    <th style={{ padding: '16px 20px' }}>Stock Control</th>
                    <th style={{ padding: '16px 20px' }}>Status</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.image_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: #{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                        {p.category_name || 'General'}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>
                        ₹{formatINR(p.price_paise)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleAdjustStock(p.id, p.stock_quantity, -1)}
                          >
                            -
                          </button>
                          <span style={{
                            minWidth: '32px',
                            textAlign: 'center',
                            fontWeight: 700,
                            color: p.stock_quantity <= 5 ? '#f59e0b' : '#fff'
                          }}>
                            {p.stock_quantity}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleAdjustStock(p.id, p.stock_quantity, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {p.stock_quantity <= 0 ? (
                          <span className="badge badge-rose">Out of Stock</span>
                        ) : p.stock_quantity <= 5 ? (
                          <span className="badge badge-gold">Low Stock</span>
                        ) : (
                          <span className="badge badge-emerald">Available</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 20px' }}>Order Number</th>
                    <th style={{ padding: '16px 20px' }}>Customer</th>
                    <th style={{ padding: '16px 20px' }}>Date</th>
                    <th style={{ padding: '16px 20px' }}>Total Amount</th>
                    <th style={{ padding: '16px 20px' }}>Status Update</th>
                    <th style={{ padding: '16px 20px' }}>Line Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>
                        {ord.order_number}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{ord.shipping_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{ord.shipping_email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#10b981' }}>
                        ₹{formatINR(ord.total_amount_paise)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-glass)',
                            background: '#111827',
                            color: ord.status === 'delivered' ? '#10b981' : ord.status === 'cancelled' ? '#f43f5e' : '#f59e0b'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx}>&bull; {it.product_name} (&times;{it.quantity})</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showProductModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => setShowProductModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Bang & Olufsen Beoplay Portal"
                    style={{ width: '100%' }}
                    id="admin-form-product-name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={productForm.priceRupees}
                      onChange={(e) => setProductForm({ ...productForm, priceRupees: e.target.value })}
                      placeholder="e.g. 19999"
                      style={{ width: '100%' }}
                      id="admin-form-product-price"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span>Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Image URL (Unsplash or direct asset) *
                  </label>
                  <input
                    type="url"
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Full Product Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter comprehensive marketing and technical description..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowProductModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    id="admin-save-product-submit"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

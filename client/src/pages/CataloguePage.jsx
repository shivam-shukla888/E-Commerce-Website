import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';

export function CataloguePage({
  categories = [],
  initialCategory = null,
  initialSearch = '',
  onViewProduct,
  onAddToCart,
  addedProductIds = new Set(),
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [search, setSearch] = useState(initialSearch || '');
  const [sort, setSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(150000); // Up to ₹1,50,000
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (sort) params.set('sort', sort);
      if (inStockOnly) params.set('inStock', 'true');
      if (maxPrice < 150000) params.set('maxPrice', (maxPrice * 100).toString());
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch catalogue products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, sort, inStockOnly, maxPrice, search]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setSort('featured');
    setInStockOnly(false);
    setMaxPrice(150000);
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header and Breadcrumbs */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Storefront</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>All Products Collection</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Showing {pagination.total} engineered luxury products ready for instant dispatch.
          </p>
        </div>

        {/* Filter & Controls Bar */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search products by title or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
                id="catalogue-search-filter"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '12px', color: 'var(--text-dim)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} style={{ color: 'var(--text-dim)' }} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ minWidth: '180px' }}
                id="catalogue-sort-select"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* In-Stock Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                id="catalogue-in-stock-checkbox"
              />
              <span>In-Stock Only</span>
            </label>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Price:</span>
              <input
                type="range"
                min="2000"
                max="150000"
                step="2000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                id="catalogue-price-slider"
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', minWidth: '75px' }}>
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingTop: '16px',
            marginTop: '16px',
            borderTop: '1px solid var(--border-glass)',
          }}>
            <button
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', margin: '40px 0' }}>
            <Search size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No matching products found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              We couldn't find any products matching your current search or filter criteria.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                  isAdded={addedProductIds.has(prod.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '50px'
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchProducts(pagination.page - 1)}
                >
                  &larr; Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => fetchProducts(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchProducts(pagination.page + 1)}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

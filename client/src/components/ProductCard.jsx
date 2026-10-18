import React from 'react';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';

export function ProductCard({ product, onAddToCart, onViewDetails, isAdded = false }) {
  const priceRupees = (product.price_paise / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div className="glass-card product-card" id={`product-card-${product.id}`}>
      <div className="product-img-wrap" onClick={() => onViewDetails(product)} style={{ cursor: 'pointer' }}>
        <img 
          src={product.image_url} 
          alt={product.name} 
          loading="lazy" 
        />
        
        {/* Badges */}
        <div className="product-badge-float">
          {product.is_featured === 1 && (
            <span className="badge badge-gold" style={{ marginRight: '6px' }}>Featured</span>
          )}
          {isOutOfStock ? (
            <span className="badge badge-rose">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-gold">Only {product.stock_quantity} left</span>
          ) : (
            <span className="badge badge-emerald">In Stock</span>
          )}
        </div>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category_name || 'Premium'}</span>
          <div className="product-rating">
            <Star size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({product.review_count || 12})</span>
          </div>
        </div>

        <h3 
          className="product-name" 
          onClick={() => onViewDetails(product)}
          style={{ cursor: 'pointer' }}
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Price</div>
            <div className="product-price">₹{priceRupees}</div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => onViewDetails(product)}
              title="View product details"
              aria-label={`View details for ${product.name}`}
            >
              <Eye size={18} />
            </button>
            <button 
              className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                borderColor: isAdded ? '#10b981' : undefined,
                color: isAdded ? '#6ee7b7' : undefined,
              }}
              id={`add-to-cart-btn-${product.id}`}
            >
              {isAdded ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                <>
                  <ShoppingBag size={16} /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

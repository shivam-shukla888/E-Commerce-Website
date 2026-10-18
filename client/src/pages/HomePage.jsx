import React from 'react';
import { Hero } from '../components/Hero';
import { FeaturedCategories } from '../components/FeaturedCategories';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

export function HomePage({ 
  categories = [], 
  products = [], 
  onSelectCategory, 
  onViewProduct, 
  onAddToCart,
  addedProductIds = new Set(),
  onExploreAll
}) {
  const featuredProducts = products.filter(p => p.is_featured === 1).slice(0, 4);
  const newArrivals = products.slice(-4).reverse();

  return (
    <div>
      {/* Hero */}
      <Hero onExploreClick={onExploreAll} />

      {/* Featured Categories */}
      <FeaturedCategories 
        categories={categories} 
        onSelectCategory={onSelectCategory} 
      />

      {/* Featured Products Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
                <Flame size={14} /> Spotlight
              </span>
              <h2 style={{ fontSize: '2rem' }}>Featured Masterpieces</h2>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onExploreAll}
            >
              <span>Explore All Products</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
                isAdded={addedProductIds.has(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* New Arrivals Section */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
                <Sparkles size={14} /> Fresh Drops
              </span>
              <h2 style={{ fontSize: '2rem' }}>New Season Arrivals</h2>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onExploreAll}
            >
              <span>See Collection</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-grid">
            {newArrivals.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
                isAdded={addedProductIds.has(product.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

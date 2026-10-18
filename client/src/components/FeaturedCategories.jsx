import React from 'react';
import { ArrowRight } from 'lucide-react';

export function FeaturedCategories({ categories = [], onSelectCategory }) {
  return (
    <section id="categories" style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Collections</span>
            <h2 style={{ fontSize: '2rem' }}>Curated Departments</h2>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectCategory(null)}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => onSelectCategory(cat.slug)}
              style={{ cursor: 'pointer' }}
            >
              <img src={cat.image_url} alt={cat.name} loading="lazy" />
              <div className="category-overlay">
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '4px' }}>{cat.name}</h3>
                <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 500 }}>
                  {cat.product_count || '12'} Products &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductDetailPage } from './pages/ProductDetailPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('luxemart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('luxemart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('luxemart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Could not save cart', e);
    }
  }, [cart]);

  // Load initial categories and products
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          fetch('/api/categories').then(r => r.json()).catch(() => ({ categories: [] })),
          fetch('/api/products').then(r => r.json()).catch(() => ({ products: [] })),
        ]);
        if (catsRes.categories) setCategories(catsRes.categories);
        if (prodsRes.products) setProducts(prodsRes.products);
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleNavigate = (page, param = null) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (param?.category) {
      setSelectedCategory(param.category);
    }
    if (param?.product) {
      setSelectedProduct(param.product);
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price_paise: product.price_paise,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        category_name: product.category_name,
        quantity: Math.min(quantity, product.stock_quantity),
      }];
    });

    setAddedProductIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProductIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        cartCount={totalCartCount}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        user={user}
        onOpenAuth={() => handleNavigate('login')}
        onLogout={() => {
          localStorage.removeItem('luxemart_token');
          localStorage.removeItem('luxemart_user');
          setUser(null);
          handleNavigate('home');
        }}
        searchQuery={searchQuery}
        onSearch={(query) => {
          setSearchQuery(query);
          if (currentPage !== 'catalogue') {
            setCurrentPage('catalogue');
          }
        }}
      />

      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            categories={categories}
            products={products}
            onSelectCategory={(catSlug) => {
              setSelectedCategory(catSlug);
              handleNavigate('catalogue');
            }}
            onViewProduct={(product) => {
              setSelectedProduct(product);
              handleNavigate('product-detail');
            }}
            onAddToCart={handleAddToCart}
            addedProductIds={addedProductIds}
            onExploreAll={() => handleNavigate('catalogue')}
          />
        )}

        {currentPage === 'catalogue' && (
          <CataloguePage
            categories={categories}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            onViewProduct={(product) => {
              setSelectedProduct(product);
              handleNavigate('product-detail');
            }}
            onAddToCart={handleAddToCart}
            addedProductIds={addedProductIds}
          />
        )}

        {currentPage === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('catalogue')}
            onAddToCart={handleAddToCart}
            onBuyNow={(prod, qty) => {
              handleAddToCart(prod, qty);
              handleNavigate('cart');
            }}
            isAdded={addedProductIds.has(selectedProduct.id)}
            addedProductIds={addedProductIds}
            onViewProduct={(product) => {
              setSelectedProduct(product);
              handleNavigate('product-detail');
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

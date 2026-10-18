const bcrypt = require('bcryptjs');
const { getDb } = require('./connection');
const { initSchema } = require('./schema');

function seedDatabase(customDb = null, force = false) {
  const db = customDb || getDb();
  initSchema(db);

  if (process.argv.includes('--force') || force) {
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM users;
    `);
  } else {
    // Check if products already seeded
    const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
    if (existingProducts.count >= 10) {
      console.log('Database already seeded. Skipping.');
      return;
    }
    // Clean before fresh seed to avoid partial conflicts
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM users;
    `);
  }

  console.log('Seeding database with demo categories, products, and users...');

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, phone, address, city, postal_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const saltRounds = 10;
  const adminHash = bcrypt.hashSync('Admin@12345', saltRounds);
  const customerHash = bcrypt.hashSync('Customer@12345', saltRounds);

  insertUser.run(
    'admin@ecommerce.test',
    adminHash,
    'System Administrator',
    'admin',
    '+91 99999 88888',
    'Tech Tower, High Street',
    'Bengaluru',
    '560001'
  );

  const customerId = insertUser.run(
    'customer@ecommerce.test',
    customerHash,
    'Aarav Sharma',
    'customer',
    '+91 98765 43210',
    '402, Lotus Grandeur, Linking Road',
    'Mumbai',
    '400050'
  ).lastInsertRowid;

  // Categories
  const categories = [
    {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'Laptops, performance accessories, and high-tech gear.',
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Premium Audio',
      slug: 'audio-sound',
      description: 'Studio headphones, high-fidelity speakers, and wireless audio.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Modern silhouettes, luxury leather accessories, and refined staples.',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Smart Wearables',
      slug: 'wearables',
      description: 'Smartwatches, fitness bands, and connected life devices.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Ergonomic workspace essentials and smart home decor.',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url)
    VALUES (?, ?, ?, ?)
  `);

  const categoryMap = {};
  for (const cat of categories) {
    const result = insertCategory.run(cat.name, cat.slug, cat.description, cat.image_url);
    categoryMap[cat.slug] = result.lastInsertRowid;
  }

  // Products
  const products = [
    {
      name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry-leading noise cancellation with two processors and eight microphones. Ultra-comfortable lightweight design with soft fit leather, 30-hour battery life, and crystal-clear hands-free calling.',
      price_paise: 2999000, // ₹29,990.00
      category_id: categoryMap['audio-sound'],
      stock_quantity: 18,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 86,
      is_featured: 1,
      specs: JSON.stringify({
        'Battery Life': '30 Hours (ANC ON)',
        'Noise Cancellation': 'Dual Processor V1 + QN1',
        'Connectivity': 'Bluetooth 5.2 / 3.5mm Aux',
        'Weight': '250g',
        'Fast Charging': '3 min charge gives 3 hours playback',
      }),
    },
    {
      name: 'Apple MacBook Air M3 (13.6-inch Liquid Retina, 16GB, 512GB)',
      slug: 'apple-macbook-air-m3-13',
      description: 'Supercharged by the M3 chip with an 8-core CPU and up to 10-core GPU. Strikingly thin design with up to 18 hours of battery life, 1080p FaceTime HD camera, and immersive spatial audio.',
      price_paise: 11490000, // ₹1,14,900.00
      category_id: categoryMap['electronics'],
      stock_quantity: 9,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 142,
      is_featured: 1,
      specs: JSON.stringify({
        'Processor': 'Apple M3 Chip (8-Core CPU)',
        'Unified Memory': '16GB',
        'Storage': '512GB Ultra-Fast SSD',
        'Display': '13.6-inch Liquid Retina with True Tone',
        'Weight': '1.24 kg',
      }),
    },
    {
      name: 'Logitech MX Master 3S Advanced Wireless Mouse',
      slug: 'logitech-mx-master-3s-mouse',
      description: 'An icon remastered with Quiet Clicks and 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling delivers 1,000 lines per second in silence.',
      price_paise: 899500, // ₹8,995.00
      category_id: categoryMap['electronics'],
      stock_quantity: 26,
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 58,
      is_featured: 0,
      specs: JSON.stringify({
        'Sensor': 'Darkfield High Precision 8000 DPI',
        'Battery': '500 mAh rechargeable Li-Po',
        'Buttons': '7 Customizable buttons',
        'Connectivity': 'Bluetooth Low Energy & Logi Bolt',
      }),
    },
    {
      name: 'Keychron K2 Pro Custom Wireless Mechanical Keyboard',
      slug: 'keychron-k2-pro-keyboard',
      description: 'QMK/VIA wireless custom mechanical keyboard offering infinite customization possibilities. Pre-lubed Keychron K Pro switches with south-facing RGB and hot-swappable PCB.',
      price_paise: 949900, // ₹9,499.00
      category_id: categoryMap['electronics'],
      stock_quantity: 15,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 43,
      is_featured: 1,
      specs: JSON.stringify({
        'Layout': '75% Compact (84 keys)',
        'Switches': 'Hot-Swappable K Pro Brown',
        'Keycaps': 'Double-shot OSA PBT',
        'Battery': '4000 mAh',
      }),
    },
    {
      name: 'Bose SoundLink Revolve+ II 360 Bluetooth Speaker',
      slug: 'bose-soundlink-revolve-plus-ii',
      description: 'Deep, loud and immersive sound with true 360-degree coverage. Durable, water-and dust-resistant design (IP55) with a flexible fabric handle for easy mobility.',
      price_paise: 2450000, // ₹24,500.00
      category_id: categoryMap['audio-sound'],
      stock_quantity: 12,
      image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      review_count: 31,
      is_featured: 0,
      specs: JSON.stringify({
        'Battery Life': 'Up to 17 Hours',
        'Durability': 'IP55 Water & Dust Resistant',
        'Microphone': 'Built-in for Speakerphone & Voice Assistant',
        'Range': 'Up to 9m (30 ft)',
      }),
    },
    {
      name: 'Samsung Galaxy Watch6 Classic (47mm LTE Sapphire)',
      slug: 'samsung-galaxy-watch6-classic',
      description: 'Timeless luxury with the rotating physical bezel. Advanced sleep coaching, body composition analysis (BIA), ECG monitoring, and sapphire crystal glass.',
      price_paise: 3299900, // ₹32,999.00
      category_id: categoryMap['wearables'],
      stock_quantity: 14,
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 67,
      is_featured: 1,
      specs: JSON.stringify({
        'Display': '1.5-inch Super AMOLED Sapphire Glass',
        'Connectivity': 'LTE + Bluetooth 5.3 + NFC',
        'Water Resistance': '5ATM + IP68 / MIL-STD-810H',
        'Sensors': 'BioActive Sensor (HR, ECG, BIA)',
      }),
    },
    {
      name: 'Artisan Full-Grain Italian Leather Travel Backpack',
      slug: 'italian-leather-travel-backpack',
      description: 'Handcrafted from vegetable-tanned Italian calfskin leather. Padded compartment fits up to 16-inch laptops, water-resistant micro-suede lining, and antique brass hardware.',
      price_paise: 649900, // ₹6,499.00
      category_id: categoryMap['fashion-apparel'],
      stock_quantity: 20,
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 52,
      is_featured: 1,
      specs: JSON.stringify({
        'Material': '100% Full Grain Italian Leather',
        'Capacity': '22 Liters',
        'Laptop Sleeve': 'Padded fit up to 16-inch MacBook',
        'Warranty': '5-Year Craftsmanship Guarantee',
      }),
    },
    {
      name: 'Heavyweight Organic Cotton Oversized Essential Hoodie',
      slug: 'heavyweight-organic-cotton-hoodie',
      description: '450 GSM French Terry 100% organic combed cotton. Pre-shrunk luxury drop-shoulder fit with double-layered hood and kangaroo pocket for effortless everyday styling.',
      price_paise: 299900, // ₹2,999.00
      category_id: categoryMap['fashion-apparel'],
      stock_quantity: 40,
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      rating: 4.5,
      review_count: 28,
      is_featured: 0,
      specs: JSON.stringify({
        'Fabric': '450 GSM 100% Organic Cotton French Terry',
        'Fit': 'Oversized Boxy Silhouette',
        'Care': 'Machine wash cold, tumble dry low',
        'Color': 'Vintage Onyx Black',
      }),
    },
    {
      name: 'Ember Smart Temperature Control Ceramic Mug 2 (295ml)',
      slug: 'ember-smart-temperature-ceramic-mug',
      description: 'Keeps your hot drink at your exact preferred drinking temperature (between 50°C and 62.5°C) from the first sip to the last drop. Up to 1.5 hours battery life or all day on charging coaster.',
      price_paise: 1249900, // ₹12,499.00
      category_id: categoryMap['home-living'],
      stock_quantity: 11,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      review_count: 39,
      is_featured: 0,
      specs: JSON.stringify({
        'Temperature Range': '50°C - 62.5°C',
        'Capacity': '295 ml (10 oz)',
        'Battery Life': '80 minutes on battery, all day on coaster',
        'App Control': 'iOS & Android Bluetooth Pairing',
      }),
    },
    {
      name: 'Herman Miller Style Ergonomic High-Back Mesh Chair',
      slug: 'ergonomic-high-back-mesh-office-chair',
      description: 'Engineered for 12+ hour seating comfort. Breathable 3D woven mesh, dynamic lumbar matrix, 4D adjustable armrests, and synchronous tilt mechanism with lockable recline.',
      price_paise: 2199000, // ₹21,990.00
      category_id: categoryMap['home-living'],
      stock_quantity: 6,
      image_url: 'https://images.unsplash.com/photo-1580481077195-c22880c54e72?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 74,
      is_featured: 1,
      specs: JSON.stringify({
        'Mechanism': 'Synchronous Tilt with 4 Locking Angles',
        'Material': 'High Tensile Korean Breathable Mesh',
        'Base': 'Heavy-Duty Die-Cast Aluminum Base',
        'Weight Capacity': '150 kg',
      }),
    },
    {
      name: 'Anker MagGo 10,000mAh Qi2 Ultra-Fast Magnetic Power Bank',
      slug: 'anker-maggo-10000mah-magnetic-power-bank',
      description: 'Certified Qi2 15W wireless charging for iPhone 15/14/13/12. Smart display shows battery percentage and estimated recharge time. Foldable kickstand for hands-free viewing.',
      price_paise: 389900, // ₹3,899.00
      category_id: categoryMap['electronics'],
      stock_quantity: 32,
      image_url: 'https://images.unsplash.com/photo-1609592807693-a5b6c7a6e11e?auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      review_count: 61,
      is_featured: 0,
      specs: JSON.stringify({
        'Capacity': '10,000 mAh (38.5Wh)',
        'Wireless Output': '15W Max (Qi2 Certified)',
        'USB-C Output': '27W Max Two-Way Fast Charge',
        'Display': 'Digital Smart TFT Screen',
      }),
    },
    {
      name: 'Focusrite Scarlett 2i2 4th Gen USB Audio Interface',
      slug: 'focusrite-scarlett-2i2-4th-gen',
      description: 'Studio-grade audio converter with 120dB dynamic range. Redesigned 4th Gen mic preamps with 69dB gain range, Auto Gain, Clip Safe, and updated Air mode with Harmonic Drive.',
      price_paise: 1699900, // ₹16,999.00
      category_id: categoryMap['audio-sound'],
      stock_quantity: 8,
      image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 89,
      is_featured: 1,
      specs: JSON.stringify({
        'Resolution': '24-bit / 192 kHz',
        'Inputs': '2 XLR / 1/4" Combo Mic/Line/Instrument',
        'Dynamic Range': '120 dB',
        'Features': 'Auto Gain, Clip Safe, Air Mode',
      }),
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, slug, description, price_paise, category_id, stock_quantity,
      image_url, additional_images, rating, review_count, is_featured, specs
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertedProductIds = [];
  for (const p of products) {
    const res = insertProduct.run(
      p.name,
      p.slug,
      p.description,
      p.price_paise,
      p.category_id,
      p.stock_quantity,
      p.image_url,
      '[]',
      p.rating,
      p.review_count,
      p.is_featured,
      p.specs
    );
    insertedProductIds.push({ id: res.lastInsertRowid, ...p });
  }

  // Create an initial sample order for the customer
  const sampleItems = [
    {
      productId: insertedProductIds[0].id,
      name: insertedProductIds[0].name,
      pricePaise: insertedProductIds[0].price_paise,
      quantity: 1,
    },
  ];

  const subtotal = sampleItems[0].pricePaise;
  const shipping = subtotal >= 99900 ? 0 : 9900;
  const tax = Math.round((subtotal * 18) / 100);
  const total = subtotal + shipping + tax;
  const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + '-DEMO';

  const orderRes = db.prepare(`
    INSERT INTO orders (
      order_number, user_id, subtotal_paise, shipping_fee_paise, tax_paise, total_amount_paise,
      status, shipping_name, shipping_email, shipping_phone, shipping_address,
      shipping_city, shipping_postal_code, payment_method, payment_status, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderNumber,
    customerId,
    subtotal,
    shipping,
    tax,
    total,
    'processing',
    'Aarav Sharma',
    'customer@ecommerce.test',
    '+91 98765 43210',
    '402, Lotus Grandeur, Linking Road',
    'Mumbai',
    '400050',
    'simulated_card',
    'completed',
    'Demo seeded order for verification'
  );

  db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, unit_price_paise, quantity, subtotal_paise)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    orderRes.lastInsertRowid,
    sampleItems[0].productId,
    sampleItems[0].name,
    sampleItems[0].pricePaise,
    sampleItems[0].quantity,
    sampleItems[0].pricePaise * sampleItems[0].quantity
  );

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
};

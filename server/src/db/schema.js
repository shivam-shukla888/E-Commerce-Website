function initSchema(db) {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      phone TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price_paise INTEGER NOT NULL CHECK(price_paise >= 0),
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
      image_url TEXT NOT NULL,
      additional_images TEXT DEFAULT '[]',
      rating REAL DEFAULT 4.5 CHECK(rating >= 0 AND rating <= 5),
      review_count INTEGER DEFAULT 12 CHECK(review_count >= 0),
      is_featured INTEGER DEFAULT 0 CHECK(is_featured IN (0, 1)),
      specs TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subtotal_paise INTEGER NOT NULL CHECK(subtotal_paise >= 0),
      shipping_fee_paise INTEGER NOT NULL CHECK(shipping_fee_paise >= 0),
      tax_paise INTEGER NOT NULL CHECK(tax_paise >= 0),
      total_amount_paise INTEGER NOT NULL CHECK(total_amount_paise >= 0),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      shipping_name TEXT NOT NULL,
      shipping_email TEXT NOT NULL,
      shipping_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_postal_code TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'simulated_card' CHECK(payment_method IN ('simulated_card', 'simulated_upi', 'cash_on_delivery')),
      payment_status TEXT NOT NULL DEFAULT 'completed' CHECK(payment_status IN ('pending', 'completed', 'refunded')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      product_name TEXT NOT NULL,
      unit_price_paise INTEGER NOT NULL CHECK(unit_price_paise >= 0),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      subtotal_paise INTEGER NOT NULL CHECK(subtotal_paise >= 0)
    );

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);
}

module.exports = {
  initSchema,
};

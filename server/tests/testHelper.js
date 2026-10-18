process.env.NODE_ENV = 'test';
const bcrypt = require('bcryptjs');
const { getDb } = require('../src/db/connection');
const { initSchema } = require('../src/db/schema');
const { generateToken } = require('../src/middleware/auth');

function setupTestDatabase() {
  const db = getDb();
  initSchema(db);

  // Clear existing records
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  // Insert test users
  const salt = 10;
  const hash = bcrypt.hashSync('Password@123', salt);

  const adminResult = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('admin@test.com', ?, 'Test Admin', 'admin')
  `).run(hash);

  const customer1Result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, phone, address, city, postal_code)
    VALUES ('user1@test.com', ?, 'Customer One', 'customer', '+91 98765 00001', '123 Test St', 'Mumbai', '400001')
  `).run(hash);

  const customer2Result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, phone, address, city, postal_code)
    VALUES ('user2@test.com', ?, 'Customer Two', 'customer', '+91 98765 00002', '456 Sample Ave', 'Delhi', '110001')
  `).run(hash);

  const adminUser = { id: adminResult.lastInsertRowid, email: 'admin@test.com', full_name: 'Test Admin', role: 'admin' };
  const customer1 = { id: customer1Result.lastInsertRowid, email: 'user1@test.com', full_name: 'Customer One', role: 'customer' };
  const customer2 = { id: customer2Result.lastInsertRowid, email: 'user2@test.com', full_name: 'Customer Two', role: 'customer' };

  const adminToken = generateToken(adminUser);
  const customer1Token = generateToken(customer1);
  const customer2Token = generateToken(customer2);

  // Insert categories
  const cat1 = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url)
    VALUES ('Electronics', 'electronics', 'Gadgets', 'https://example.com/cat1.jpg')
  `).run().lastInsertRowid;

  const cat2 = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url)
    VALUES ('Audio', 'audio', 'Headphones and speakers', 'https://example.com/cat2.jpg')
  `).run().lastInsertRowid;

  // Insert test products
  const prod1 = db.prepare(`
    INSERT INTO products (name, slug, description, price_paise, category_id, stock_quantity, image_url, rating, is_featured)
    VALUES ('Pro Studio Headphones', 'pro-studio-headphones', 'High-res audio', 1500000, ?, 10, 'https://example.com/p1.jpg', 4.8, 1)
  `).run(cat2).lastInsertRowid;

  const prod2 = db.prepare(`
    INSERT INTO products (name, slug, description, price_paise, category_id, stock_quantity, image_url, rating, is_featured)
    VALUES ('Ergonomic Mouse', 'ergonomic-mouse', 'Comfort mouse', 250000, ?, 2, 'https://example.com/p2.jpg', 4.5, 0)
  `).run(cat1).lastInsertRowid;

  return {
    db,
    adminUser,
    customer1,
    customer2,
    adminToken,
    customer1Token,
    customer2Token,
    categoryIds: { electronics: cat1, audio: cat2 },
    productIds: { headphones: prod1, mouse: prod2 },
  };
}

module.exports = {
  setupTestDatabase,
};

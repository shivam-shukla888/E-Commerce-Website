const express = require('express');
const { getDb } = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { formatPaiseToINR } = require('../utils/currency');

const router = express.Router();

// Enforce authentication AND admin role on all admin routes
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/admin/metrics
 * Store analytics KPI summary
 */
router.get('/metrics', (req, res, next) => {
  try {
    const db = getDb();

    const revenueRow = db.prepare('SELECT COALESCE(SUM(total_amount_paise), 0) AS total_revenue_paise FROM orders WHERE status != "cancelled"').get();
    const ordersCountRow = db.prepare('SELECT COUNT(*) AS total_orders FROM orders').get();
    const productsCountRow = db.prepare('SELECT COUNT(*) AS total_products FROM products').get();
    const lowStockRow = db.prepare('SELECT COUNT(*) AS low_stock_count FROM products WHERE stock_quantity <= 5').get();
    const customersCountRow = db.prepare('SELECT COUNT(*) AS total_customers FROM users WHERE role = "customer"').get();

    // Recent orders (last 5)
    const recentOrders = db.prepare(`
      SELECT id, order_number, shipping_name, total_amount_paise, status, created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      metrics: {
        totalRevenuePaise: revenueRow.total_revenue_paise,
        totalRevenueFormatted: formatPaiseToINR(revenueRow.total_revenue_paise),
        totalOrders: ordersCountRow.total_orders,
        totalProducts: productsCountRow.total_products,
        lowStockCount: lowStockRow.low_stock_count,
        totalCustomers: customersCountRow.total_customers,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/orders
 * Fetch all customer orders with optional status filter
 */
router.get('/orders', (req, res, next) => {
  try {
    const db = getDb();
    const { status } = req.query;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';

    const orders = db.prepare(query).all(...params);
    const getItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const ordersWithItems = orders.map(ord => ({
      ...ord,
      items: getItemsStmt.all(ord.id),
    }));

    res.json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const db = getDb();
    const order = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);

    res.json({
      success: true,
      message: `Order #${req.params.id} status updated to ${status}.`,
      status,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products
 * Create a new product
 */
router.post('/products', (req, res, next) => {
  try {
    const {
      name,
      description,
      pricePaise,
      categoryId,
      stockQuantity = 0,
      imageUrl,
      isFeatured = 0,
      specs = {},
    } = req.body;

    if (!name || !description || pricePaise === undefined || !categoryId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and image URL are required.',
      });
    }

    const db = getDb();

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const insert = db.prepare(`
      INSERT INTO products (
        name, slug, description, price_paise, category_id, stock_quantity,
        image_url, additional_images, rating, review_count, is_featured, specs
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, '[]', 5.0, 1, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      slug,
      description.trim(),
      parseInt(pricePaise, 10),
      parseInt(categoryId, 10),
      parseInt(stockQuantity, 10) || 0,
      imageUrl.trim(),
      isFeatured ? 1 : 0,
      typeof specs === 'object' ? JSON.stringify(specs) : '{}'
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProduct,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/products/:id
 * Update an existing product
 */
router.put('/products/:id', (req, res, next) => {
  try {
    const {
      name,
      description,
      pricePaise,
      categoryId,
      stockQuantity,
      imageUrl,
      isFeatured,
      specs,
    } = req.body;

    const db = getDb();
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    db.prepare(`
      UPDATE products
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          price_paise = COALESCE(?, price_paise),
          category_id = COALESCE(?, category_id),
          stock_quantity = COALESCE(?, stock_quantity),
          image_url = COALESCE(?, image_url),
          is_featured = COALESCE(?, is_featured),
          specs = COALESCE(?, specs),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      description ? description.trim() : null,
      pricePaise !== undefined ? parseInt(pricePaise, 10) : null,
      categoryId ? parseInt(categoryId, 10) : null,
      stockQuantity !== undefined ? parseInt(stockQuantity, 10) : null,
      imageUrl ? imageUrl.trim() : null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      specs ? (typeof specs === 'object' ? JSON.stringify(specs) : specs) : null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/products/:id/stock
 * Quick stock quantity update
 */
router.put('/products/:id/stock', (req, res, next) => {
  try {
    const { stockQuantity } = req.body;
    const qty = parseInt(stockQuantity, 10);

    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity required (0 or greater).' });
    }

    const db = getDb();
    db.prepare('UPDATE products SET stock_quantity = ?, updated_at = datetime(\'now\') WHERE id = ?').run(qty, req.params.id);

    res.json({
      success: true,
      message: 'Inventory stock level adjusted.',
      stockQuantity: qty,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete product (prevents deletion if present in order items)
 */
router.delete('/products/:id', (req, res, next) => {
  try {
    const db = getDb();
    const prodId = req.params.id;

    // Check if in order items
    const orderItemsCount = db.prepare('SELECT COUNT(*) AS count FROM order_items WHERE product_id = ?').get(prodId);
    if (orderItemsCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product: it is associated with existing customer order records. Set stock to 0 instead.',
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(prodId);

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

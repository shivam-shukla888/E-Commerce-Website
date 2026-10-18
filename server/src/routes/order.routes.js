const express = require('express');
const { getDb } = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
const { calculateOrderTotals } = require('../utils/currency');

const router = express.Router();

/**
 * POST /api/orders
 * Place a new order with atomic SQLite database transaction and inventory deduction
 */
router.post('/', authenticateToken, (req, res, next) => {
  const db = getDb();
  try {
    const {
      items,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      paymentMethod = 'simulated_card',
      notes = '',
    } = req.body;

    // Validate inputs
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one valid item.',
      });
    }

    if (!shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required.',
      });
    }

    const validPaymentMethods = ['simulated_card', 'simulated_upi', 'cash_on_delivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method selected.',
      });
    }

    // Atomic transaction for order creation and inventory deduction
    const executeOrderTransaction = db.transaction(() => {
      const getProductStmt = db.prepare('SELECT id, name, price_paise, stock_quantity FROM products WHERE id = ?');
      const deductStockStmt = db.prepare('UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = datetime("now") WHERE id = ?');
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, subtotal_paise, shipping_fee_paise, tax_paise, total_amount_paise,
          status, shipping_name, shipping_email, shipping_phone, shipping_address,
          shipping_city, shipping_postal_code, payment_method, payment_status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, 'processing', ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
      `);
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, unit_price_paise, quantity, subtotal_paise)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Verify stock & calculate server totals
      const verifiedItems = [];
      for (const item of items) {
        const prodId = parseInt(item.productId, 10);
        const qty = parseInt(item.quantity, 10);

        if (isNaN(prodId) || isNaN(qty) || qty <= 0) {
          throw new Error('Invalid product ID or quantity specified.');
        }

        const product = getProductStmt.get(prodId);
        if (!product) {
          throw new Error(`Product ID ${prodId} could not be found.`);
        }

        if (product.stock_quantity < qty) {
          const err = new Error(`Insufficient inventory for "${product.name}". Only ${product.stock_quantity} available.`);
          err.statusCode = 400;
          err.isOperational = true;
          throw err;
        }

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          unitPricePaise: product.price_paise,
          quantity: qty,
        });
      }

      // Calculate server pricing strictly in paise
      const totals = calculateOrderTotals(verifiedItems);

      // Deduct stock
      for (const item of verifiedItems) {
        deductStockStmt.run(item.quantity, item.productId);
      }

      // Generate unique human-readable order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderNumber = `ORD-${datePart}-${randomSuffix}`;

      // Insert Order
      const orderResult = insertOrderStmt.run(
        orderNumber,
        req.user.id,
        totals.subtotalPaise,
        totals.shippingFeePaise,
        totals.taxPaise,
        totals.totalPaise,
        shippingName.trim(),
        shippingEmail.trim(),
        shippingPhone ? shippingPhone.trim() : '',
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingPostalCode.trim(),
        paymentMethod,
        notes ? notes.trim() : ''
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert Order Items
      const savedItems = [];
      for (const item of verifiedItems) {
        const subtotalItemPaise = item.unitPricePaise * item.quantity;
        insertItemStmt.run(
          orderId,
          item.productId,
          item.productName,
          item.unitPricePaise,
          item.quantity,
          subtotalItemPaise
        );
        savedItems.push({
          productId: item.productId,
          product_name: item.productName,
          unit_price_paise: item.unitPricePaise,
          quantity: item.quantity,
          subtotal_paise: subtotalItemPaise,
        });
      }

      return {
        id: orderId,
        order_number: orderNumber,
        user_id: req.user.id,
        subtotal_paise: totals.subtotalPaise,
        shipping_fee_paise: totals.shippingFeePaise,
        tax_paise: totals.taxPaise,
        total_amount_paise: totals.totalPaise,
        status: 'processing',
        shipping_name: shippingName.trim(),
        shipping_email: shippingEmail.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity.trim(),
        shipping_postal_code: shippingPostalCode.trim(),
        payment_method: paymentMethod,
        payment_status: 'completed',
        created_at: new Date().toISOString(),
        items: savedItems,
      };
    });

    const completedOrder = executeOrderTransaction();

    res.status(201).json({
      success: true,
      message: 'Order confirmed and inventory reserved.',
      order: completedOrder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/my-orders
 * Get orders belonging exclusively to the authenticated customer
 */
router.get('/my-orders', authenticateToken, (req, res, next) => {
  try {
    const db = getDb();
    const orders = db.prepare(`
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.user.id);

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
 * GET /api/orders/:id
 * Retrieve a specific order by ID with customer authorization check
 */
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Customer Isolation Check: users can only view their own order unless admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

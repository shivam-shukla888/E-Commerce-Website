const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase } = require('./testHelper');

describe('Order Processing, Inventory & Security Tests', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = setupTestDatabase();
  });

  test('POST /api/orders places order and decrements stock inventory atomically', async () => {
    // Initial stock of mouse is 2
    const initialMouse = testEnv.db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(testEnv.productIds.mouse);
    assert.equal(initialMouse.stock_quantity, 2);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`)
      .send({
        shippingName: 'Customer One',
        shippingEmail: 'user1@test.com',
        shippingPhone: '+91 98765 00001',
        shippingAddress: '123 Test St',
        shippingCity: 'Mumbai',
        shippingPostalCode: '400001',
        paymentMethod: 'simulated_card',
        items: [
          { productId: testEnv.productIds.mouse, quantity: 1 }
        ],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.order.order_number);

    // Verify stock decremented to 1 in database
    const updatedMouse = testEnv.db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(testEnv.productIds.mouse);
    assert.equal(updatedMouse.stock_quantity, 1);
  });

  test('POST /api/orders rejects order when requested quantity exceeds inventory', async () => {
    // Stock is 2, requesting 5
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`)
      .send({
        shippingName: 'Customer One',
        shippingEmail: 'user1@test.com',
        shippingPhone: '+91 98765 00001',
        shippingAddress: '123 Test St',
        shippingCity: 'Mumbai',
        shippingPostalCode: '400001',
        paymentMethod: 'simulated_card',
        items: [
          { productId: testEnv.productIds.mouse, quantity: 5 }
        ],
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Insufficient inventory/);

    // Stock must remain unchanged
    const mouse = testEnv.db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(testEnv.productIds.mouse);
    assert.equal(mouse.stock_quantity, 2);
  });

  test('Customer Order Isolation: Customer B cannot view Customer A order', async () => {
    // Customer 1 places order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`)
      .send({
        shippingName: 'Customer One',
        shippingEmail: 'user1@test.com',
        shippingPhone: '+91 98765 00001',
        shippingAddress: '123 Test St',
        shippingCity: 'Mumbai',
        shippingPostalCode: '400001',
        paymentMethod: 'simulated_card',
        items: [
          { productId: testEnv.productIds.headphones, quantity: 1 }
        ],
      });

    const orderId = orderRes.body.order.id;

    // Customer 1 can view own order
    const cust1Res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${testEnv.customer1Token}`);
    assert.equal(cust1Res.status, 200);

    // Customer 2 tries to view Customer 1's order -> MUST BE 403 Forbidden!
    const cust2Res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${testEnv.customer2Token}`);
    assert.equal(cust2Res.status, 403);
    assert.equal(cust2Res.body.success, false);

    // Admin CAN view order
    const adminRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${testEnv.adminToken}`);
    assert.equal(adminRes.status, 200);
  });

  test('Admin can update order status', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`)
      .send({
        shippingName: 'Customer One',
        shippingEmail: 'user1@test.com',
        shippingPhone: '+91 98765 00001',
        shippingAddress: '123 Test St',
        shippingCity: 'Mumbai',
        shippingPostalCode: '400001',
        items: [{ productId: testEnv.productIds.headphones, quantity: 1 }],
      });

    const orderId = orderRes.body.order.id;

    const updateRes = await request(app)
      .put(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${testEnv.adminToken}`)
      .send({ status: 'shipped' });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.status, 'shipped');

    // Verify in database
    const dbOrder = testEnv.db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId);
    assert.equal(dbOrder.status, 'shipped');
  });
});

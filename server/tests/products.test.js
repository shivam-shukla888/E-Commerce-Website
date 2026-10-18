const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase } = require('./testHelper');

describe('Product Catalogue & Management API Tests', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = setupTestDatabase();
  });

  test('GET /api/products returns paginated products with category names', async () => {
    const res = await request(app).get('/api/products');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.products.length, 2);
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.total, 2);
  });

  test('GET /api/products filters by search keyword', async () => {
    const res = await request(app).get('/api/products?search=Headphones');

    assert.equal(res.status, 200);
    assert.equal(res.body.products.length, 1);
    assert.equal(res.body.products[0].name, 'Pro Studio Headphones');
  });

  test('GET /api/products filters by category slug', async () => {
    const res = await request(app).get('/api/products?category=audio');

    assert.equal(res.status, 200);
    assert.equal(res.body.products.length, 1);
    assert.equal(res.body.products[0].name, 'Pro Studio Headphones');
  });

  test('GET /api/products/:identifier returns product details by slug', async () => {
    const res = await request(app).get('/api/products/pro-studio-headphones');

    assert.equal(res.status, 200);
    assert.equal(res.body.product.name, 'Pro Studio Headphones');
    assert.ok(Array.isArray(res.body.product.related_products));
  });

  test('POST /api/admin/products rejects unauthorized customer users (403)', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`)
      .send({
        name: 'Hacked Product',
        description: 'Unauthorized creation',
        pricePaise: 1000,
        categoryId: testEnv.categoryIds.electronics,
        imageUrl: 'https://example.com/hack.jpg',
      });

    assert.equal(res.status, 403);
  });

  test('POST /api/admin/products allows admin to create product', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${testEnv.adminToken}`)
      .send({
        name: 'Ultra Mechanical Keyboard',
        description: 'RGB wireless custom switches',
        pricePaise: 899900,
        categoryId: testEnv.categoryIds.electronics,
        stockQuantity: 25,
        imageUrl: 'https://example.com/keyboard.jpg',
        isFeatured: 1,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.product.name, 'Ultra Mechanical Keyboard');
    assert.equal(res.body.product.stock_quantity, 25);
  });
});

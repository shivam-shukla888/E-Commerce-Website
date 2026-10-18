const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase } = require('./testHelper');

describe('Authentication & User Account API Tests', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = setupTestDatabase();
  });

  test('POST /api/auth/register fails with missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bademail', password: 'short' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register succeeds and hashes password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@test.com',
        password: 'Password@123',
        fullName: 'New Customer',
        phone: '+91 99999 11111',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'newuser@test.com');
    assert.equal(res.body.user.role, 'customer');
    assert.equal(res.body.user.password_hash, undefined); // Never leak password hash!
  });

  test('POST /api/auth/register rejects duplicate email addresses', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user1@test.com', // already seeded
        password: 'Password@123',
        fullName: 'Duplicate User',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'Password@123',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'user1@test.com');
  });

  test('POST /api/auth/login rejects incorrect passwords', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'WrongPassword999',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/auth/me requires valid bearer token', async () => {
    const unauthRes = await request(app).get('/api/auth/me');
    assert.equal(unauthRes.status, 401);

    const authRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testEnv.customer1Token}`);

    assert.equal(authRes.status, 200);
    assert.equal(authRes.body.user.email, 'user1@test.com');
  });
});

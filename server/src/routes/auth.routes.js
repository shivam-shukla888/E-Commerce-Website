const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/connection');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegisterInput, validateLoginInput } = require('../middleware/validator');

const router = express.Router();

/**
 * POST /api/auth/register
 * Create a new customer user
 */
router.post('/register', authLimiter, validateRegisterInput, (req, res, next) => {
  try {
    const { email, password, fullName, phone, address, city, postalCode } = req.body;
    const db = getDb();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    const insert = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role, phone, address, city, postal_code)
      VALUES (?, ?, ?, 'customer', ?, ?, ?, ?)
    `);

    const result = insert.run(
      email.toLowerCase().trim(),
      passwordHash,
      fullName.trim(),
      phone ? phone.trim() : null,
      address ? address.trim() : null,
      city ? city.trim() : null,
      postalCode ? postalCode.trim() : null
    );

    const newUser = {
      id: result.lastInsertRowid,
      email: email.toLowerCase().trim(),
      full_name: fullName.trim(),
      role: 'customer',
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      city: city ? city.trim() : null,
      postal_code: postalCode ? postalCode.trim() : null,
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        postalCode: newUser.postal_code,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * User login with password hash comparison
 */
router.post('/login', authLimiter, validateLoginInput, (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postalCode: user.postal_code,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const orderStats = db.prepare(`
    SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount_paise), 0) AS total_spent_paise
    FROM orders
    WHERE user_id = ?
  `).get(req.user.id);

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
      city: req.user.city,
      postalCode: req.user.postal_code,
      createdAt: req.user.created_at,
    },
    stats: {
      totalOrders: orderStats.total_orders,
      totalSpentPaise: orderStats.total_spent_paise,
    },
  });
});

/**
 * PUT /api/auth/profile
 * Update profile details (address, phone, name)
 */
router.put('/profile', authenticateToken, (req, res, next) => {
  try {
    const { fullName, phone, address, city, postalCode } = req.body;
    const db = getDb();

    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          postal_code = COALESCE(?, postal_code),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      fullName ? fullName.trim() : null,
      phone ? phone.trim() : null,
      address ? address.trim() : null,
      city ? city.trim() : null,
      postalCode ? postalCode.trim() : null,
      req.user.id
    );

    const updatedUser = db.prepare('SELECT id, email, full_name, role, phone, address, city, postal_code FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postal_code,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

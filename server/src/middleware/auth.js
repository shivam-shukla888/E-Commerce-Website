const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../db/connection');

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session token.',
      });
    }

    // Verify user still exists in SQLite database
    const db = getDb();
    const user = db.prepare('SELECT id, email, full_name, role, phone, address, city, postal_code, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user account associated with this session no longer exists.',
      });
    }

    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator privileges required.',
    });
  }
  next();
}

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
};

const rateLimit = require('express-rate-limit');
const config = require('../config');

// Rate limiter for authentication routes to prevent credential brute-forcing
const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 30, // 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // skip in automated tests
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax * 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  apiLimiter,
};

const path = require('path');
const dotenv = require('dotenv');

// Load .env from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local server .env if present

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_ecommerce_2026_super_secure',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../storage/ecommerce.db'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10) * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  // Shipping thresholds: Free shipping above ₹999 (99900 paise), else ₹99 (9900 paise)
  freeShippingThresholdPaise: 99900,
  standardShippingFeePaise: 9900,
  // GST Tax rate: 18%
  taxRatePercent: 18,
};

module.exports = config;

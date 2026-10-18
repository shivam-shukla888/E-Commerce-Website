const config = require('../config');

function errorHandler(err, req, res, next) {
  // Log server side for debugging
  console.error(`[API Error] ${req.method} ${req.url}:`, err.message);

  const statusCode = err.statusCode || (res.statusCode && res.statusCode >= 400 ? res.statusCode : 500);

  const response = {
    success: false,
    message: err.isOperational ? err.message : (statusCode === 500 ? 'An unexpected internal server error occurred.' : err.message),
  };

  // Only include debug stack trace in non-production development environments
  if (config.nodeEnv === 'development' && statusCode === 500) {
    response.debugError = err.message;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
};

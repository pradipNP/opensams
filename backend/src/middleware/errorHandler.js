const config = require('../config');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    statusCode === 500 && config.isProduction
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || [],
    },
  });
}

module.exports = errorHandler;

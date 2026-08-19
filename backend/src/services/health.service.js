const config = require('../config');
const db = require('../config/database');
const AppError = require('../utils/AppError');

async function getHealth() {
  try {
    await db.ping();
    return {
      status: 'ok',
      version: config.version,
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    throw new AppError(503, 'INTERNAL_ERROR', 'Database unavailable');
  }
}

module.exports = {
  getHealth,
};

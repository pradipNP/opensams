const config = require('../config');
const db = require('../config/database');
const AppError = require('../utils/AppError');

async function getHealth() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await db.ping();
      return {
        status: 'ok',
        version: config.version,
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`Database ping failed (attempt ${attempt}/3):`, err.code || err.message);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw new AppError(503, 'INTERNAL_ERROR', 'Database unavailable');
}

module.exports = {
  getHealth,
};

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeDatabaseUrl(url) {
  return String(url || '')
    .replace(/&channel_binding=require/gi, '')
    .replace(/\?channel_binding=require&/gi, '?')
    .replace(/\?channel_binding=require$/gi, '');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

const config = {
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT || 5000),
  version: process.env.APP_VERSION || '1.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: requireEnv('JWT_SECRET', nodeEnv === 'production' ? undefined : 'sams-dev-jwt-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  db: {
    connectionString: databaseUrl,
    sslRequired:
      nodeEnv === 'production' ||
      databaseUrl.includes('sslmode=require') ||
      String(process.env.PGSSLMODE || '') === 'require',
  },
};

if (!config.db.connectionString) {
  throw new Error('DATABASE_URL is required');
}

module.exports = config;

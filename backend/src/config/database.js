const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.db.connectionString,
  ssl: config.db.sslRequired ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function ping() {
  const result = await pool.query('SELECT 1 AS ok, NOW() AS timestamp');
  return result.rows[0];
}

async function closePool() {
  await pool.end();
}

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  getClient,
  ping,
  closePool,
  withTransaction,
};

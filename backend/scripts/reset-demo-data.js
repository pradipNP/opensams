const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const SEED_FILES = [
  '001_roles.sql',
  '002_provinces.sql',
  '003_municipalities.sql',
  '004_schools.sql',
  '005_asset_categories.sql',
  '006_asset_statuses.sql',
  '007_demo_users.sql',
  '008_demo_assets.sql',
];

const TRUNCATE_SQL = `
TRUNCATE TABLE
  asset_history,
  maintenance_requests,
  asset_transfers,
  assets,
  asset_tag_sequences,
  users,
  schools,
  municipalities,
  asset_categories,
  asset_statuses,
  roles,
  provinces
RESTART IDENTITY CASCADE
`;

function seedsDirectory() {
  return path.resolve(__dirname, '../../database/seeds');
}

function splitPostgresStatements(sql) {
  const statements = [];
  let buffer = '';
  let inSingle = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null;

  for (let i = 0; i < sql.length; i += 1) {
    const two = sql.slice(i, i + 2);

    if (inLineComment) {
      buffer += sql[i];
      if (sql[i] === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      buffer += sql[i];
      if (two === '*/') {
        buffer += sql[i + 1];
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        buffer += dollarTag;
        i += dollarTag.length - 1;
        dollarTag = null;
      } else {
        buffer += sql[i];
      }
      continue;
    }

    if (!inSingle && two === '--') {
      inLineComment = true;
      buffer += two;
      i += 1;
      continue;
    }

    if (!inSingle && two === '/*') {
      inBlockComment = true;
      buffer += two;
      i += 1;
      continue;
    }

    if (!inSingle && sql[i] === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        dollarTag = match[0];
        buffer += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
    }

    if (sql[i] === "'") {
      buffer += sql[i];
      if (inSingle && sql[i + 1] === "'") {
        buffer += sql[i + 1];
        i += 1;
      } else {
        inSingle = !inSingle;
      }
      continue;
    }

    if (!inSingle && sql[i] === ';') {
      const statement = buffer.trim();
      if (statement) {
        statements.push(statement);
      }
      buffer = '';
      continue;
    }

    buffer += sql[i];
  }

  const tail = buffer.trim();
  if (tail) {
    statements.push(tail);
  }
  return statements;
}

function createPoolFromEnv() {
  const config = require('../src/config');
  return new Pool({
    connectionString: config.db.connectionString,
    ssl: config.db.sslRequired ? { rejectUnauthorized: false } : false,
  });
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = splitPostgresStatements(sql);
  for (const statement of statements) {
    await client.query(statement);
  }
}

async function resetDemoData(existingPool) {
  const dir = seedsDirectory();
  if (!fs.existsSync(dir)) {
    throw new Error(`Seed directory not found: ${dir}`);
  }

  const ownPool = !existingPool;
  const pool = existingPool || createPoolFromEnv();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(TRUNCATE_SQL);
    for (const fileName of SEED_FILES) {
      await runSqlFile(client, path.join(dir, fileName));
    }
    await client.query('COMMIT');
    console.log('Demo data reset to seed snapshot (3 users, 27 schools, 500 assets).');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    if (ownPool) {
      await pool.end();
    }
  }
}

function isDemoResetEnabled() {
  return String(process.env.DEMO_RESET_ENABLED || '').toLowerCase() === 'true';
}

function demoResetIntervalMs() {
  const hours = Number(process.env.DEMO_RESET_INTERVAL_HOURS || 24);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 24 * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

async function main() {
  if (!isDemoResetEnabled() && process.env.DEMO_RESET_FORCE !== 'true') {
    console.error('Refusing to reset. Set DEMO_RESET_ENABLED=true or DEMO_RESET_FORCE=true.');
    process.exit(1);
  }
  await resetDemoData();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  resetDemoData,
  isDemoResetEnabled,
  demoResetIntervalMs,
};

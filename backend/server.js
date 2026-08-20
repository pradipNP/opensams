const config = require('./src/config');
const createApp = require('./src/app');
const db = require('./src/config/database');
const {
  resetDemoData,
  isDemoResetEnabled,
  demoResetIntervalMs,
} = require('./scripts/reset-demo-data');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`SAMS Nepal API listening on port ${config.port} (${config.env})`);
});

let demoResetTimer = null;

if (isDemoResetEnabled()) {
  const intervalMs = demoResetIntervalMs();
  console.log(`Demo data reset is enabled. Next snapshot restore in ${Math.round(intervalMs / 3600000)} hour(s).`);
  demoResetTimer = setInterval(() => {
    resetDemoData(db.pool).catch((error) => {
      console.error('Scheduled demo data reset failed', error);
    });
  }, intervalMs);
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  if (demoResetTimer) {
    clearInterval(demoResetTimer);
  }
  server.close(async () => {
    await db.closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));



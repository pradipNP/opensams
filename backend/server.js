const config = require('./src/config');
const createApp = require('./src/app');
const db = require('./src/config/database');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`SAMS Nepal API listening on port ${config.port} (${config.env})`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await db.closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

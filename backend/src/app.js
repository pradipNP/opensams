const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const apiRoutes = require('./routes');
const healthRoutes = require('./routes/health.routes');
const openapiSpec = require('./docs/openapi');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'SAMS Nepal API',
        version: config.version,
      },
    });
  });

  app.use('/health', healthRoutes);
  app.get('/api/docs.json', (req, res) => res.json(openapiSpec));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: 'SAMS Nepal API Docs',
    })
  );
  app.use('/api/v1', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

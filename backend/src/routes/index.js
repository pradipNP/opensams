const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const provinceRoutes = require('./provinces.routes');
const municipalityRoutes = require('./municipalities.routes');
const schoolRoutes = require('./schools.routes');
const assetRoutes = require('./assets.routes');
const dashboardRoutes = require('./dashboard.routes');
const maintenanceRoutes = require('./maintenance.routes');
const transferRoutes = require('./transfers.routes');
const reportsRoutes = require('./reports.routes');
const categoryRoutes = require('./categories.routes');
const statusRoutes = require('./statuses.routes');
const userRoutes = require('./users.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/provinces', provinceRoutes);
router.use('/municipalities', municipalityRoutes);
router.use('/schools', schoolRoutes);
router.use('/assets', assetRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/transfers', transferRoutes);
router.use('/reports', reportsRoutes);
router.use('/categories', categoryRoutes);
router.use('/statuses', statusRoutes);
router.use('/users', userRoutes);

module.exports = router;

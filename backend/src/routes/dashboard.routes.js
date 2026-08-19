const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { PERMISSIONS } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.DASHBOARD_READ));

router.get('/', dashboardController.overview);
router.get('/kpis', dashboardController.kpis);
router.get('/charts/municipality', dashboardController.municipality);
router.get('/charts/school', dashboardController.school);
router.get('/charts/category', dashboardController.category);
router.get('/charts/status', dashboardController.status);
router.get('/charts/value-by-municipality', dashboardController.valueByMunicipality);
router.get('/charts/transfers', dashboardController.transfers);

module.exports = router;

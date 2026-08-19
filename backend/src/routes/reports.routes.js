const express = require('express');
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const {
  inventoryQuery,
  municipalityQuery,
  schoolQuery,
  maintenanceQuery,
  transfersQuery,
  summaryQuery,
  exportPathQuery,
  runExportFilterValidators,
} = require('../validators/reports.validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/inventory',
  authorize(PERMISSIONS.REPORTS_READ),
  inventoryQuery,
  validate,
  reportsController.inventory
);
router.get(
  '/municipality',
  authorize(PERMISSIONS.REPORTS_READ),
  municipalityQuery,
  validate,
  reportsController.municipality
);
router.get(
  '/school',
  authorize(PERMISSIONS.REPORTS_READ),
  schoolQuery,
  validate,
  reportsController.school
);
router.get(
  '/maintenance',
  authorize(PERMISSIONS.REPORTS_READ),
  maintenanceQuery,
  validate,
  reportsController.maintenance
);
router.get(
  '/transfers',
  authorize(PERMISSIONS.REPORTS_READ),
  transfersQuery,
  validate,
  reportsController.transfers
);
router.get(
  '/summary',
  authorize(PERMISSIONS.REPORTS_READ),
  summaryQuery,
  validate,
  reportsController.summary
);
router.get(
  '/:reportType/export',
  authorize(PERMISSIONS.REPORTS_READ),
  exportPathQuery,
  runExportFilterValidators,
  validate,
  reportsController.exportReport
);

module.exports = router;

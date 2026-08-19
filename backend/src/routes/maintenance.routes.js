const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const {
  listMaintenance,
  idParam,
  createMaintenance,
  approveMaintenance,
  rejectMaintenance,
  completeMaintenance,
} = require('../validators/maintenance.validators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.MAINTENANCE_READ), listMaintenance, validate, maintenanceController.list);
router.post(
  '/',
  authorize(PERMISSIONS.MAINTENANCE_REQUEST),
  createMaintenance,
  validate,
  maintenanceController.create
);
router.get('/:id', authorize(PERMISSIONS.MAINTENANCE_READ), idParam, validate, maintenanceController.getById);
router.put(
  '/:id/approve',
  authorize(PERMISSIONS.MAINTENANCE_APPROVE),
  approveMaintenance,
  validate,
  maintenanceController.approve
);
router.put(
  '/:id/reject',
  authorize(PERMISSIONS.MAINTENANCE_APPROVE),
  rejectMaintenance,
  validate,
  maintenanceController.reject
);
router.put(
  '/:id/complete',
  authorize(PERMISSIONS.MAINTENANCE_APPROVE),
  completeMaintenance,
  validate,
  maintenanceController.complete
);

module.exports = router;

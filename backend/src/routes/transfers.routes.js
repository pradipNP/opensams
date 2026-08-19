const express = require('express');
const transferController = require('../controllers/transfer.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const {
  listTransfers,
  idParam,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  cancelTransfer,
} = require('../validators/transfer.validators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.TRANSFERS_READ), listTransfers, validate, transferController.list);
router.post(
  '/',
  authorize(PERMISSIONS.TRANSFERS_REQUEST),
  createTransfer,
  validate,
  transferController.create
);
router.get('/:id', authorize(PERMISSIONS.TRANSFERS_READ), idParam, validate, transferController.getById);
router.put(
  '/:id/approve',
  authorize(PERMISSIONS.TRANSFERS_APPROVE),
  approveTransfer,
  validate,
  transferController.approve
);
router.put(
  '/:id/reject',
  authorize(PERMISSIONS.TRANSFERS_APPROVE),
  rejectTransfer,
  validate,
  transferController.reject
);
router.put(
  '/:id/complete',
  authorize(PERMISSIONS.TRANSFERS_APPROVE),
  completeTransfer,
  validate,
  transferController.complete
);
router.put(
  '/:id/cancel',
  authorize(PERMISSIONS.TRANSFERS_REQUEST),
  cancelTransfer,
  validate,
  transferController.cancel
);

module.exports = router;

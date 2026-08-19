const express = require('express');
const assetController = require('../controllers/asset.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, requireRoles } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS, ROLES } = require('../constants/roles');
const {
  listAssets,
  assetIdParam,
  verifyTagParam,
  historyQuery,
  createAsset,
  updateAsset,
} = require('../validators/asset.validators');

const router = express.Router();

router.get('/verify/:tag', verifyTagParam, validate, assetController.verify);

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.ASSETS_READ), listAssets, validate, assetController.list);
router.post('/', authorize(PERMISSIONS.ASSETS_WRITE), createAsset, validate, assetController.create);
router.get(
  '/:id/history',
  authorize(PERMISSIONS.HISTORY_READ),
  historyQuery,
  validate,
  assetController.history
);
router.get('/:id/qr', authorize(PERMISSIONS.ASSETS_READ), assetIdParam, validate, assetController.qr);
router.get('/:id', authorize(PERMISSIONS.ASSETS_READ), assetIdParam, validate, assetController.getById);
router.put('/:id', authorize(PERMISSIONS.ASSETS_WRITE), updateAsset, validate, assetController.update);
router.delete(
  '/:id',
  requireRoles(ROLES.STATE_ADMIN, ROLES.SCHOOL_ADMIN),
  authorize(PERMISSIONS.ASSETS_WRITE),
  assetIdParam,
  validate,
  assetController.remove
);

module.exports = router;

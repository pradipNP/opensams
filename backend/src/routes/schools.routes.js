const express = require('express');
const schoolController = require('../controllers/school.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const { listAssets } = require('../validators/asset.validators');
const {
  listSchools,
  schoolIdParam,
  createSchool,
  updateSchool,
} = require('../validators/school.validators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.SCHOOLS_READ), listSchools, validate, schoolController.list);
router.post(
  '/',
  authorize(PERMISSIONS.SCHOOLS_WRITE),
  createSchool,
  validate,
  schoolController.create
);
router.get(
  '/:id/assets',
  authorize(PERMISSIONS.ASSETS_READ),
  schoolIdParam,
  listAssets,
  validate,
  schoolController.listAssets
);
router.get('/:id', authorize(PERMISSIONS.SCHOOLS_READ), schoolIdParam, validate, schoolController.getById);
router.put(
  '/:id',
  authorize(PERMISSIONS.SCHOOLS_WRITE),
  updateSchool,
  validate,
  schoolController.update
);

module.exports = router;

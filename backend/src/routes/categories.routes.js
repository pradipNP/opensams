const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const {
  listCategories,
  createCategory,
  updateCategory,
} = require('../validators/category.validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  authorize(PERMISSIONS.CATEGORIES_READ),
  listCategories,
  validate,
  categoryController.list
);
router.post(
  '/',
  authorize(PERMISSIONS.CATEGORIES_WRITE),
  createCategory,
  validate,
  categoryController.create
);
router.put(
  '/:id',
  authorize(PERMISSIONS.CATEGORIES_WRITE),
  updateCategory,
  validate,
  categoryController.update
);

module.exports = router;

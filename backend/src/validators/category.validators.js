const { body, param, query } = require('express-validator');

const listCategories = [
  query('department').optional().isString().trim().isLength({ max: 100 }).withMessage('department is too long'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
];

const categoryIdParam = [param('id').isUUID().withMessage('id must be a valid UUID')];

const createCategory = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('name is required'),
  body('department').isString().trim().isLength({ min: 1, max: 100 }).withMessage('department is required'),
  body('description').optional({ nullable: true }).isString().trim(),
];

const updateCategory = [
  ...categoryIdParam,
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('name is required'),
  body('department').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('department is required'),
  body('description').optional({ nullable: true }).isString().trim(),
  body('isActive')
    .optional()
    .custom((value) => value === true || value === false)
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  listCategories,
  categoryIdParam,
  createCategory,
  updateCategory,
};

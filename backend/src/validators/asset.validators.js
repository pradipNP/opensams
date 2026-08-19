const { body, param, query } = require('express-validator');

const listAssets = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  query('statusId').optional().isUUID().withMessage('statusId must be a valid UUID'),
  query('purchaseDateFrom').optional().isISO8601({ strict: true }).withMessage('purchaseDateFrom must be a valid date'),
  query('purchaseDateTo').optional().isISO8601({ strict: true }).withMessage('purchaseDateTo must be a valid date'),
  query('department').optional().isString().trim().isLength({ max: 100 }),
  query('sort')
    .optional()
    .isIn(['created_at', 'name', 'purchase_cost', 'asset_tag', 'purchase_date'])
    .withMessage('sort must be created_at, name, purchase_cost, asset_tag, or purchase_date'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

const assetIdParam = [param('id').isUUID().withMessage('id must be a valid UUID')];

const verifyTagParam = [
  param('tag')
    .matches(/^SAMS-[A-Z0-9]+-\d{4}-\d{4}$/)
    .withMessage('tag must match SAMS-{CODE}-{YEAR}-{SEQ}'),
];

const historyQuery = [
  ...assetIdParam,
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('action')
    .optional()
    .isIn([
      'created',
      'updated',
      'status_changed',
      'transferred',
      'maintenance_requested',
      'maintenance_completed',
      'deleted',
      'restored',
    ])
    .withMessage('action is invalid'),
];

const optionalDate = (field) =>
  body(field)
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .withMessage(`${field} must be a valid date`);

const createAsset = [
  body('name').isString().trim().isLength({ min: 1, max: 300 }).withMessage('name is required'),
  body('categoryId').isUUID().withMessage('categoryId must be a valid UUID'),
  body('schoolId').isUUID().withMessage('schoolId must be a valid UUID'),
  body('statusId').isUUID().withMessage('statusId must be a valid UUID'),
  body('department').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  body('location').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  optionalDate('purchaseDate'),
  body('purchaseCost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('purchaseCost must be 0 or greater'),
  optionalDate('warrantyExpiry'),
  body('vendor').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const updateAsset = [
  ...assetIdParam,
  body('name').optional().isString().trim().isLength({ min: 1, max: 300 }).withMessage('name is required'),
  body('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  body('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  body('statusId').optional().isUUID().withMessage('statusId must be a valid UUID'),
  body('department').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  body('location').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  optionalDate('purchaseDate'),
  body('purchaseCost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('purchaseCost must be 0 or greater'),
  optionalDate('warrantyExpiry'),
  body('vendor').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('notes').optional({ nullable: true }).isString().trim(),
];

module.exports = {
  listAssets,
  assetIdParam,
  verifyTagParam,
  historyQuery,
  createAsset,
  updateAsset,
};

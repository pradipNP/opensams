const { query, param } = require('express-validator');

const REPORT_TYPES = ['inventory', 'municipality', 'school', 'maintenance', 'transfers', 'summary'];
const EXPORT_FORMATS = ['xlsx', 'pdf'];

const inventoryQuery = [
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

const municipalityQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
];

const schoolQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
];

const MAINTENANCE_STATUSES = ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'];
const MAINTENANCE_PRIORITIES = ['low', 'medium', 'high', 'critical', 'urgent'];

const maintenanceQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(MAINTENANCE_STATUSES).withMessage('status is invalid'),
  query('priority').optional().isIn(MAINTENANCE_PRIORITIES).withMessage('priority is invalid'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('assetId').optional().isUUID().withMessage('assetId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('dateFrom').optional().isISO8601({ strict: true }).withMessage('dateFrom must be a valid date'),
  query('dateTo').optional().isISO8601({ strict: true }).withMessage('dateTo must be a valid date'),
  query('sort')
    .optional()
    .isIn(['requested_at', 'approved_at', 'completed_at', 'priority', 'status', 'estimated_cost', 'actual_cost'])
    .withMessage('sort must be requested_at, approved_at, completed_at, priority, status, estimated_cost, or actual_cost'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

const TRANSFER_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];

const transfersQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(TRANSFER_STATUSES).withMessage('status is invalid'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('assetId').optional().isUUID().withMessage('assetId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('dateFrom').optional().isISO8601({ strict: true }).withMessage('dateFrom must be a valid date'),
  query('dateTo').optional().isISO8601({ strict: true }).withMessage('dateTo must be a valid date'),
  query('sort')
    .optional()
    .isIn(['requested_at', 'approved_at', 'completed_at', 'status', 'transfer_date'])
    .withMessage('sort must be requested_at, approved_at, completed_at, status, or transfer_date'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

const summaryQuery = [
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
];

const FILTER_VALIDATORS = {
  inventory: inventoryQuery,
  municipality: municipalityQuery,
  school: schoolQuery,
  maintenance: maintenanceQuery,
  transfers: transfersQuery,
  summary: summaryQuery,
};

const exportPathQuery = [
  param('reportType').isIn(REPORT_TYPES).withMessage('reportType is invalid'),
  query('format').exists().withMessage('format is required').isIn(EXPORT_FORMATS).withMessage('format must be xlsx or pdf'),
];

async function runExportFilterValidators(req, res, next) {
  try {
    const validators = FILTER_VALIDATORS[req.params.reportType];
    if (validators) {
      await Promise.all(validators.map((validator) => validator.run(req)));
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  REPORT_TYPES,
  EXPORT_FORMATS,
  inventoryQuery,
  municipalityQuery,
  schoolQuery,
  maintenanceQuery,
  transfersQuery,
  summaryQuery,
  exportPathQuery,
  runExportFilterValidators,
};

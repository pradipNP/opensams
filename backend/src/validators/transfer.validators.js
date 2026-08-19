const { body, param, query } = require('express-validator');

const STATUSES = ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];

const listTransfers = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(STATUSES).withMessage('status is invalid'),
  query('assetId').optional().isUUID().withMessage('assetId must be a valid UUID'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }),
];

const idParam = [param('id').isUUID().withMessage('id must be a valid UUID')];

const createTransfer = [
  body('assetId').isUUID().withMessage('assetId must be a valid UUID'),
  body('toSchoolId').isUUID().withMessage('toSchoolId must be a valid UUID'),
  body('reason').isString().trim().isLength({ min: 1, max: 4000 }).withMessage('reason is required'),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const approveTransfer = [
  ...idParam,
  body('notes').optional({ nullable: true }).isString().trim(),
];

const rejectTransfer = [
  ...idParam,
  body('rejectionReason').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('rejectionReason is required'),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const completeTransfer = [
  ...idParam,
  body('notes').optional({ nullable: true }).isString().trim(),
];

const cancelTransfer = [
  ...idParam,
  body('notes').optional({ nullable: true }).isString().trim(),
];

module.exports = {
  listTransfers,
  idParam,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  cancelTransfer,
};

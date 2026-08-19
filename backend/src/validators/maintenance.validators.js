const { body, param, query } = require('express-validator');

const PRIORITIES = ['low', 'medium', 'high', 'critical', 'urgent'];
const STATUSES = ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'];

const listMaintenance = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(STATUSES).withMessage('status is invalid'),
  query('priority').optional().isIn(PRIORITIES).withMessage('priority is invalid'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('assetId').optional().isUUID().withMessage('assetId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }),
];

const idParam = [param('id').isUUID().withMessage('id must be a valid UUID')];

const createMaintenance = [
  body('assetId').isUUID().withMessage('assetId must be a valid UUID'),
  body('description').isString().trim().isLength({ min: 1, max: 4000 }).withMessage('description is required'),
  body('priority')
    .optional()
    .customSanitizer((value) => String(value).trim().toLowerCase())
    .isIn(PRIORITIES)
    .withMessage('priority must be low, medium, high, or critical'),
  body('estimatedCost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('estimatedCost must be 0 or greater'),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const approveMaintenance = [
  ...idParam,
  body('assignedTo').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const rejectMaintenance = [
  ...idParam,
  body('rejectionReason').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('rejectionReason is required'),
  body('notes').optional({ nullable: true }).isString().trim(),
];

const completeMaintenance = [
  ...idParam,
  body('actualCost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('actualCost must be 0 or greater'),
  body('notes').optional({ nullable: true }).isString().trim(),
];

module.exports = {
  listMaintenance,
  idParam,
  createMaintenance,
  approveMaintenance,
  rejectMaintenance,
  completeMaintenance,
};

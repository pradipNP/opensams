const { body, param, query } = require('express-validator');

const uuidParam = param('id').isUUID().withMessage('id must be a valid UUID');

const listSchools = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('schoolType').optional().isString().trim().isLength({ max: 50 }).withMessage('schoolType is too long'),
];

const schoolIdParam = [uuidParam];

const createSchool = [
  body('name').isString().trim().isLength({ min: 1, max: 300 }).withMessage('name is required'),
  body('schoolCode').isString().trim().isLength({ min: 1, max: 20 }).withMessage('schoolCode is required'),
  body('schoolType').isString().trim().isLength({ min: 1, max: 50 }).withMessage('schoolType is required'),
  body('municipalityId').isUUID().withMessage('municipalityId must be a valid UUID'),
  body('address').optional({ nullable: true }).isString().trim(),
];

const updateSchool = [
  ...schoolIdParam,
  body('name').optional().isString().trim().isLength({ min: 1, max: 300 }).withMessage('name is required'),
  body('schoolCode').optional().isString().trim().isLength({ min: 1, max: 20 }).withMessage('schoolCode is required'),
  body('schoolType').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('schoolType is required'),
  body('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  body('address').optional({ nullable: true }).isString().trim(),
  body('isActive')
    .optional()
    .custom((value) => value === true || value === false)
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  listSchools,
  schoolIdParam,
  createSchool,
  updateSchool,
};

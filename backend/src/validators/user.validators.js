const { body, param, query } = require('express-validator');
const { ROLES } = require('../constants/roles');

const ROLE_SLUGS = [ROLES.STATE_ADMIN, ROLES.MUNICIPAL_OFFICER, ROLES.SCHOOL_ADMIN];

const uuidParam = param('id').isUUID().withMessage('id must be a valid UUID');

const listUsers = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('role').optional().isIn(ROLE_SLUGS).withMessage('role is invalid'),
  query('municipalityId').optional().isUUID().withMessage('municipalityId must be a valid UUID'),
  query('schoolId').optional().isUUID().withMessage('schoolId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
];

const userIdParam = [uuidParam];

const optionalUuid = (field) =>
  body(field)
    .optional({ nullable: true })
    .custom((value) => value === null || value === undefined || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value))
    .withMessage(`${field} must be a valid UUID`);

const createUser = [
  body('email').isEmail().withMessage('email must be a valid email').trim().toLowerCase(),
  body('password').isString().isLength({ min: 8, max: 128 }).withMessage('password must be at least 8 characters'),
  body('fullName').isString().trim().isLength({ min: 1, max: 200 }).withMessage('fullName is required'),
  body('role').isIn(ROLE_SLUGS).withMessage('role is invalid'),
  optionalUuid('provinceId'),
  optionalUuid('municipalityId'),
  optionalUuid('schoolId'),
];

const updateUser = [
  ...userIdParam,
  body('email').optional().isEmail().withMessage('email must be a valid email').trim().toLowerCase(),
  body('password').optional().isString().isLength({ min: 8, max: 128 }).withMessage('password must be at least 8 characters'),
  body('fullName').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('fullName is required'),
  body('role').optional().isIn(ROLE_SLUGS).withMessage('role is invalid'),
  optionalUuid('provinceId'),
  optionalUuid('municipalityId'),
  optionalUuid('schoolId'),
  body('isActive')
    .optional()
    .custom((value) => value === true || value === false)
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  listUsers,
  userIdParam,
  createUser,
  updateUser,
};

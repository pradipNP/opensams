const { body, param, query } = require('express-validator');

const uuidParam = param('id').isUUID().withMessage('id must be a valid UUID');

const listMunicipalities = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('provinceId').optional().isUUID().withMessage('provinceId must be a valid UUID'),
  query('search').optional().isString().trim().isLength({ max: 200 }).withMessage('search is too long'),
];

const municipalityIdParam = [uuidParam];

const createMunicipality = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }).withMessage('name is required'),
  body('code').isString().trim().isLength({ min: 1, max: 10 }).withMessage('code is required'),
  body('provinceId').isUUID().withMessage('provinceId must be a valid UUID'),
  body('district').isString().trim().isLength({ min: 1, max: 100 }).withMessage('district is required'),
];

const updateMunicipality = [
  ...municipalityIdParam,
  body('name').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('name is required'),
  body('code').optional().isString().trim().isLength({ min: 1, max: 10 }).withMessage('code is required'),
  body('provinceId').optional().isUUID().withMessage('provinceId must be a valid UUID'),
  body('district').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('district is required'),
  body('isActive')
    .optional()
    .custom((value) => value === true || value === false)
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  listMunicipalities,
  municipalityIdParam,
  createMunicipality,
  updateMunicipality,
};

const { param } = require('express-validator');

const provinceIdParam = [param('id').isUUID().withMessage('id must be a valid UUID')];

module.exports = {
  provinceIdParam,
};

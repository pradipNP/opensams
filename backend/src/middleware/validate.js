const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));

  return next(AppError.badRequest('Invalid request body or query params', details));
}

module.exports = validate;

const AppError = require('../utils/AppError');

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    const userPermissions = req.user.permissions || [];
    const missing = requiredPermissions.filter((permission) => !userPermissions.includes(permission));

    if (missing.length > 0) {
      return next(AppError.forbidden());
    }

    return next();
  };
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden());
    }
    return next();
  };
}

module.exports = {
  authorize,
  requireRoles,
};

const { verifyToken } = require('../utils/jwt');
const { isRevoked } = require('../utils/tokenStore');
const AppError = require('../utils/AppError');

function extractBearerToken(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token;
}

function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw AppError.unauthorized('Invalid or missing token');
    }

    const payload = verifyToken(token);
    if (isRevoked(payload.jti)) {
      throw AppError.unauthorized('Token has been revoked');
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
      provinceId: payload.provinceId || null,
      municipalityId: payload.municipalityId || null,
      schoolId: payload.schoolId || null,
      jti: payload.jti,
      exp: payload.exp,
    };
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
};

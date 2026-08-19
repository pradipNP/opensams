const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const AppError = require('./AppError');

function signToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    provinceId: user.provinceId,
    municipalityId: user.municipalityId,
    schoolId: user.schoolId,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Token has expired');
    }
    throw AppError.unauthorized('Invalid or missing token');
  }
}

module.exports = {
  signToken,
  verifyToken,
};

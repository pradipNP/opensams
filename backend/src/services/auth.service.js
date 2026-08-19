const config = require('../config');
const userRepository = require('../repositories/user.repository');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { revoke } = require('../utils/tokenStore');
const { resolvePermissions } = require('../constants/roles');
const AppError = require('../utils/AppError');

function toUserDto(row, { includeLastLogin = false } = {}) {
  const dto = {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role_slug,
    roleName: row.role_name,
    permissions: resolvePermissions(row.role_slug, row.permissions),
    provinceId: row.province_id,
    municipalityId: row.municipality_id,
    schoolId: row.school_id,
  };

  if (includeLastLogin) {
    dto.lastLoginAt = row.last_login_at;
  }

  return dto;
}

async function login(email, password) {
  const user = await userRepository.findByEmail(email);

  if (!user || !user.is_active) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const lastLogin = await userRepository.updateLastLogin(user.id);
  user.last_login_at = lastLogin?.last_login_at || user.last_login_at;

  const dto = toUserDto(user);
  const token = signToken(dto);

  return {
    token,
    expiresIn: config.jwt.expiresIn,
    user: dto,
  };
}

async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.is_active) {
    throw AppError.unauthorized('Invalid or missing token');
  }
  return toUserDto(user, { includeLastLogin: true });
}

function logout(authUser) {
  if (authUser?.jti && authUser?.exp) {
    revoke(authUser.jti, authUser.exp * 1000);
  }
  return { message: 'Logged out successfully' };
}

module.exports = {
  login,
  getCurrentUser,
  logout,
  toUserDto,
};

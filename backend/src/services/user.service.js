const userRepository = require('../repositories/user.repository');
const municipalityRepository = require('../repositories/municipality.repository');
const schoolRepository = require('../repositories/school.repository');
const provinceRepository = require('../repositories/province.repository');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { hashPassword } = require('../utils/password');
const { ROLES, resolvePermissions } = require('../constants/roles');
const AppError = require('../utils/AppError');

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

function toAdminDto(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role_slug,
    roleName: row.role_name,
    permissions: resolvePermissions(row.role_slug, row.permissions),
    provinceId: row.province_id,
    municipalityId: row.municipality_id,
    schoolId: row.school_id,
    isActive: row.is_active,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

function toListDto(row) {
  const dto = toAdminDto(row);
  delete dto.lastLoginAt;
  delete dto.createdAt;
  return dto;
}

async function assertUniqueEmail(email, excludeId) {
  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== excludeId) {
    throw AppError.conflict('A user with this email already exists');
  }
}

async function resolveAssignment(roleSlug, body, current = {}) {
  if (roleSlug === ROLES.STATE_ADMIN) {
    if (body.municipalityId) {
      throw AppError.badRequest('state_admin cannot be assigned a municipality');
    }
    if (body.schoolId) {
      throw AppError.badRequest('state_admin cannot be assigned a school');
    }
    const provinceId = body.provinceId !== undefined ? body.provinceId : current.province_id || null;
    if (provinceId) {
      const province = await provinceRepository.findById(provinceId);
      if (!province) {
        throw AppError.badRequest('Invalid provinceId');
      }
    }
    return { provinceId: provinceId || null, municipalityId: null, schoolId: null };
  }

  const scopeUser = { role: ROLES.STATE_ADMIN };

  if (roleSlug === ROLES.MUNICIPAL_OFFICER) {
    if (body.schoolId) {
      throw AppError.badRequest('municipal_officer cannot be assigned a school');
    }
    const municipalityId = body.municipalityId !== undefined
      ? body.municipalityId
      : current.municipality_id;
    if (!municipalityId) {
      throw AppError.badRequest('municipalityId is required for municipal_officer');
    }
    const municipality = await municipalityRepository.findById(scopeUser, municipalityId);
    if (!municipality) {
      throw AppError.badRequest('Invalid municipalityId');
    }
    return {
      provinceId: municipality.province_id,
      municipalityId,
      schoolId: null,
    };
  }

  if (roleSlug === ROLES.SCHOOL_ADMIN) {
    const schoolId = body.schoolId !== undefined ? body.schoolId : current.school_id;
    if (!schoolId) {
      throw AppError.badRequest('schoolId is required for school_admin');
    }
    const school = await schoolRepository.findRawById(schoolId);
    if (!school) {
      throw AppError.badRequest('Invalid schoolId');
    }
    const municipalityId = body.municipalityId !== undefined
      ? body.municipalityId
      : school.municipality_id;
    if (municipalityId !== school.municipality_id) {
      throw AppError.badRequest('municipalityId does not match the selected school');
    }
    const municipality = await municipalityRepository.findById(scopeUser, municipalityId);
    return {
      provinceId: municipality.province_id,
      municipalityId,
      schoolId,
    };
  }

  throw AppError.badRequest('Invalid role');
}

function parseOptionalBoolean(value) {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}

async function listUsers(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await userRepository.list({
    role: query.role || undefined,
    municipalityId: query.municipalityId || undefined,
    schoolId: query.schoolId || undefined,
    search: query.search?.trim() || undefined,
    isActive: parseOptionalBoolean(query.isActive),
    limit,
    offset,
  });

  return {
    data: rows.map(toListDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getUser(id) {
  const row = await userRepository.findById(id);
  if (!row) {
    throw AppError.notFound('User not found');
  }
  return toAdminDto(row);
}

async function createUser(body) {
  const email = body.email.trim();
  const fullName = body.fullName.trim();
  const roleSlug = body.role;

  const role = await userRepository.findRoleBySlug(roleSlug);
  if (!role) {
    throw AppError.badRequest('Invalid role');
  }

  await assertUniqueEmail(email);
  const assignment = await resolveAssignment(roleSlug, body);
  const passwordHash = await hashPassword(body.password);

  try {
    const inserted = await userRepository.insert({
      role_id: role.id,
      province_id: assignment.provinceId,
      municipality_id: assignment.municipalityId,
      school_id: assignment.schoolId,
      email,
      password_hash: passwordHash,
      full_name: fullName,
    });
    return getUser(inserted.id);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A user with this email already exists');
    }
    throw err;
  }
}

function isLastActiveStateAdmin(row, activeCount) {
  return row.role_slug === ROLES.STATE_ADMIN && row.is_active === true && activeCount <= 1;
}

async function updateUser(actor, id, body) {
  const current = await userRepository.findById(id);
  if (!current) {
    throw AppError.notFound('User not found');
  }

  const email = body.email !== undefined ? body.email.trim() : current.email;
  const fullName = body.fullName !== undefined ? body.fullName.trim() : current.full_name;
  const roleSlug = body.role !== undefined ? body.role : current.role_slug;
  const isActive = body.isActive !== undefined ? body.isActive : current.is_active;

  const role = await userRepository.findRoleBySlug(roleSlug);
  if (!role) {
    throw AppError.badRequest('Invalid role');
  }

  const becomingInactive = current.is_active === true && isActive === false;
  const leavingStateAdmin = current.role_slug === ROLES.STATE_ADMIN && roleSlug !== ROLES.STATE_ADMIN;

  if (becomingInactive && actor.id === id) {
    throw AppError.badRequest('You cannot deactivate your own account');
  }

  if (becomingInactive || leavingStateAdmin) {
    const activeCount = await userRepository.countActiveStateAdmins();
    if (isLastActiveStateAdmin(current, activeCount)) {
      throw AppError.conflict('Cannot deactivate or demote the last active state administrator');
    }
  }

  await assertUniqueEmail(email, id);
  const assignment = await resolveAssignment(roleSlug, body, current);
  const passwordHash = body.password
    ? await hashPassword(body.password)
    : current.password_hash;

  try {
    await userRepository.update(id, {
      role_id: role.id,
      province_id: assignment.provinceId,
      municipality_id: assignment.municipalityId,
      school_id: assignment.schoolId,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      is_active: isActive,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A user with this email already exists');
    }
    throw err;
  }

  return getUser(id);
}

async function deactivateUser(actor, id) {
  const current = await userRepository.findById(id);
  if (!current) {
    throw AppError.notFound('User not found');
  }

  if (actor.id === id) {
    throw AppError.badRequest('You cannot deactivate your own account');
  }

  if (current.is_active) {
    const activeCount = await userRepository.countActiveStateAdmins();
    if (isLastActiveStateAdmin(current, activeCount)) {
      throw AppError.conflict('Cannot deactivate the last active state administrator');
    }
  }

  await userRepository.deactivate(id);
  return { id, isActive: false };
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
};

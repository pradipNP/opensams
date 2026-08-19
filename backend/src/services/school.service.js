const schoolRepository = require('../repositories/school.repository');
const municipalityRepository = require('../repositories/municipality.repository');
const assetService = require('./asset.service');
const { parsePagination, buildMeta } = require('../utils/pagination');
const AppError = require('../utils/AppError');

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

function toListDto(row) {
  return {
    id: row.id,
    name: row.name,
    schoolCode: row.school_code,
    schoolType: row.school_type,
    address: row.address,
    municipalityId: row.municipality_id,
    municipalityName: row.municipality_name,
    municipalityCode: row.municipality_code,
    assetCount: row.asset_count,
    isActive: row.is_active,
  };
}

function toDetailDto(row) {
  return {
    id: row.id,
    name: row.name,
    schoolCode: row.school_code,
    schoolType: row.school_type,
    address: row.address,
    municipality: {
      id: row.municipality_id,
      name: row.municipality_name,
      code: row.municipality_code,
    },
    stats: {
      totalAssets: row.total_assets,
      activeAssets: row.active_assets,
      damagedAssets: row.damaged_assets,
      underMaintenance: row.under_maintenance,
      totalValue: Number(row.total_value),
    },
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listSchools(user, query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await schoolRepository.list(user, {
    municipalityId: query.municipalityId,
    search: query.search?.trim() || undefined,
    schoolType: query.schoolType?.trim() || undefined,
    limit,
    offset,
  });

  return {
    data: rows.map(toListDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getSchool(user, id) {
  const row = await schoolRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('School not found');
  }
  return toDetailDto(row);
}

async function listSchoolAssets(user, schoolId, query) {
  const school = await schoolRepository.findById(user, schoolId);
  if (!school) {
    throw AppError.notFound('School not found');
  }

  return assetService.listAssets(user, {
    ...query,
    schoolId,
  });
}

async function assertMunicipalityExists(user, municipalityId) {
  const municipality = await municipalityRepository.findById(user, municipalityId);
  if (!municipality) {
    throw AppError.badRequest('Invalid municipalityId');
  }
  return municipality;
}

async function assertUniqueSchoolCode(schoolCode, excludeId) {
  const existing = await schoolRepository.findByCode(schoolCode, excludeId);
  if (existing) {
    throw AppError.conflict('A school with this code already exists');
  }
}

async function createSchool(user, body) {
  const name = body.name.trim();
  const schoolCode = body.schoolCode.trim();
  const schoolType = body.schoolType.trim();
  const municipalityId = body.municipalityId;
  const address = body.address !== undefined && body.address !== null
    ? String(body.address).trim() || null
    : null;

  await assertMunicipalityExists(user, municipalityId);
  await assertUniqueSchoolCode(schoolCode);

  try {
    const inserted = await schoolRepository.insert({
      name,
      school_code: schoolCode,
      school_type: schoolType,
      municipality_id: municipalityId,
      address,
    });
    return getSchool(user, inserted.id);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A school with this code already exists');
    }
    throw err;
  }
}

async function updateSchool(user, id, body) {
  const current = await schoolRepository.findById(user, id);
  if (!current) {
    throw AppError.notFound('School not found');
  }

  const name = body.name !== undefined ? body.name.trim() : current.name;
  const schoolCode = body.schoolCode !== undefined ? body.schoolCode.trim() : current.school_code;
  const schoolType = body.schoolType !== undefined ? body.schoolType.trim() : current.school_type;
  const municipalityId = body.municipalityId !== undefined ? body.municipalityId : current.municipality_id;
  const address = body.address !== undefined
    ? (body.address === null ? null : String(body.address).trim() || null)
    : current.address;
  const isActive = body.isActive !== undefined ? body.isActive : current.is_active;

  if (municipalityId !== current.municipality_id) {
    await assertMunicipalityExists(user, municipalityId);
  }
  await assertUniqueSchoolCode(schoolCode, id);

  try {
    await schoolRepository.update(id, {
      name,
      school_code: schoolCode,
      school_type: schoolType,
      municipality_id: municipalityId,
      address,
      is_active: isActive,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A school with this code already exists');
    }
    throw err;
  }

  return getSchool(user, id);
}

module.exports = {
  listSchools,
  getSchool,
  listSchoolAssets,
  createSchool,
  updateSchool,
};

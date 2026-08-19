const municipalityRepository = require('../repositories/municipality.repository');
const provinceRepository = require('../repositories/province.repository');
const { parsePagination, buildMeta } = require('../utils/pagination');
const AppError = require('../utils/AppError');

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

function toListDto(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    district: row.district,
    provinceId: row.province_id,
    provinceName: row.province_name,
    schoolCount: row.school_count,
    assetCount: row.asset_count,
    isActive: row.is_active,
  };
}

function toDetailDto(row) {
  return {
    ...toListDto(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listMunicipalities(user, query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await municipalityRepository.list(user, {
    provinceId: query.provinceId,
    search: query.search?.trim() || undefined,
    limit,
    offset,
  });

  return {
    data: rows.map(toListDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getMunicipality(user, id) {
  const row = await municipalityRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Municipality not found');
  }
  return toDetailDto(row);
}

async function assertUniqueMunicipality({ name, code }, excludeId) {
  const [byName, byCode] = await Promise.all([
    municipalityRepository.findByName(name, excludeId),
    municipalityRepository.findByCode(code, excludeId),
  ]);
  if (byName) {
    throw AppError.conflict('A municipality with this name already exists');
  }
  if (byCode) {
    throw AppError.conflict('A municipality with this code already exists');
  }
}

async function assertProvinceExists(provinceId) {
  const province = await provinceRepository.findById(provinceId);
  if (!province) {
    throw AppError.badRequest('Invalid provinceId');
  }
  return province;
}

async function createMunicipality(user, body) {
  const name = body.name.trim();
  const code = body.code.trim();
  const district = body.district.trim();
  const provinceId = body.provinceId;

  await assertProvinceExists(provinceId);
  await assertUniqueMunicipality({ name, code });

  try {
    const inserted = await municipalityRepository.insert({
      name,
      code,
      province_id: provinceId,
      district,
    });
    return getMunicipality(user, inserted.id);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A municipality with this name or code already exists');
    }
    throw err;
  }
}

async function updateMunicipality(user, id, body) {
  const current = await municipalityRepository.findById(user, id);
  if (!current) {
    throw AppError.notFound('Municipality not found');
  }

  const name = body.name !== undefined ? body.name.trim() : current.name;
  const code = body.code !== undefined ? body.code.trim() : current.code;
  const district = body.district !== undefined ? body.district.trim() : current.district;
  const provinceId = body.provinceId !== undefined ? body.provinceId : current.province_id;
  const isActive = body.isActive !== undefined ? body.isActive : current.is_active;

  if (provinceId !== current.province_id) {
    await assertProvinceExists(provinceId);
  }
  await assertUniqueMunicipality({ name, code }, id);

  try {
    await municipalityRepository.update(id, {
      name,
      code,
      province_id: provinceId,
      district,
      is_active: isActive,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A municipality with this name or code already exists');
    }
    throw err;
  }

  return getMunicipality(user, id);
}

module.exports = {
  listMunicipalities,
  getMunicipality,
  createMunicipality,
  updateMunicipality,
};

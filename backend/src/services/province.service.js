const provinceRepository = require('../repositories/province.repository');
const AppError = require('../utils/AppError');

function toDto(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.is_active,
    municipalityCount: row.municipality_count,
  };
}

async function listProvinces() {
  const rows = await provinceRepository.list();
  return rows.map(toDto);
}

async function getProvince(id) {
  const row = await provinceRepository.findById(id);
  if (!row) {
    throw AppError.notFound('Province not found');
  }
  return toDto(row);
}

module.exports = {
  listProvinces,
  getProvince,
};

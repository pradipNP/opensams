const categoryRepository = require('../repositories/category.repository');
const AppError = require('../utils/AppError');

function toDto(row) {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    description: row.description,
    assetCount: row.asset_count,
    isActive: row.is_active,
  };
}

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

async function assertUniqueName(name, excludeId) {
  const existing = await categoryRepository.findByName(name, excludeId);
  if (existing) {
    throw AppError.conflict('A category with this name already exists');
  }
}

async function listCategories(query) {
  const rows = await categoryRepository.list({
    department: query.department?.trim() || undefined,
    search: query.search?.trim() || undefined,
  });
  return rows.map(toDto);
}

async function getCategory(id) {
  const row = await categoryRepository.findById(id);
  if (!row) {
    throw AppError.notFound('Category not found');
  }
  return toDto(row);
}

async function createCategory(body) {
  const name = body.name.trim();
  const department = body.department.trim();
  const description = body.description !== undefined && body.description !== null
    ? String(body.description).trim() || null
    : null;

  await assertUniqueName(name);

  try {
    const inserted = await categoryRepository.insert({ name, department, description });
    return getCategory(inserted.id);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A category with this name already exists');
    }
    throw err;
  }
}

async function updateCategory(id, body) {
  const current = await categoryRepository.findById(id);
  if (!current) {
    throw AppError.notFound('Category not found');
  }

  const name = body.name !== undefined ? body.name.trim() : current.name;
  const department = body.department !== undefined ? body.department.trim() : current.department;
  const description = body.description !== undefined
    ? (body.description === null ? null : String(body.description).trim() || null)
    : current.description;
  const isActive = body.isActive !== undefined ? body.isActive : current.is_active;

  await assertUniqueName(name, id);

  try {
    await categoryRepository.update(id, {
      name,
      department,
      description,
      is_active: isActive,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict('A category with this name already exists');
    }
    throw err;
  }

  return getCategory(id);
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
};

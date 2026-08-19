const assetRepository = require('../repositories/asset.repository');
const db = require('../config/database');
const { parsePagination, buildMeta, parseSort } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const AppError = require('../utils/AppError');

function formatDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

function toAssetDto(row) {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    name: row.name,
    category: {
      id: row.category_id,
      name: row.category_name,
      department: row.category_department,
    },
    status: {
      id: row.status_id,
      name: row.status_name,
      slug: row.status_slug,
      colorCode: row.status_color,
    },
    school: {
      id: row.school_id,
      name: row.school_name,
      schoolCode: row.school_code,
    },
    municipality: {
      id: row.municipality_id,
      name: row.municipality_name,
      code: row.municipality_code,
    },
    department: row.department,
    location: row.location,
    purchaseDate: formatDate(row.purchase_date),
    purchaseCost: Number(row.purchase_cost),
    warrantyExpiry: formatDate(row.warranty_expiry),
    vendor: row.vendor,
    qrCode: row.qr_code,
    notes: row.notes,
    createdBy: row.created_by_id
      ? { id: row.created_by_id, fullName: row.created_by_name }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toHistoryDto(row) {
  return {
    id: row.id,
    action: row.action,
    fieldName: row.field_name,
    oldValue: row.old_value,
    newValue: row.new_value,
    changedBy: row.changed_by_id
      ? { id: row.changed_by_id, fullName: row.changed_by_name }
      : null,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function assertCanWriteSchool(user, school) {
  if (user.role === ROLES.STATE_ADMIN) {
    return;
  }
  if (user.role === ROLES.SCHOOL_ADMIN && school.id === user.schoolId) {
    return;
  }
  throw AppError.forbidden();
}

async function listAssets(user, query) {
  const { page, limit, offset } = parsePagination(query);
  const sort = parseSort(query);

  const { rows, total } = await assetRepository.list(user, {
    municipalityId: query.municipalityId,
    schoolId: query.schoolId,
    categoryId: query.categoryId,
    statusId: query.statusId,
    department: query.department?.trim() || undefined,
    purchaseDateFrom: query.purchaseDateFrom || undefined,
    purchaseDateTo: query.purchaseDateTo || undefined,
    search: query.search?.trim() || undefined,
    sqlColumn: sort.sqlColumn,
    order: sort.order,
    limit,
    offset,
  });

  return {
    data: rows.map(toAssetDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getAsset(user, id) {
  const row = await assetRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Asset not found');
  }

  const history = await assetRepository.listRecentHistory(id, 5);
  return {
    ...toAssetDto(row),
    recentHistory: history.map(toHistoryDto),
  };
}

async function verifyAsset(tag) {
  const row = await assetRepository.findByTag(tag);
  if (!row) {
    throw AppError.notFound('Asset not found');
  }

  return {
    assetTag: row.asset_tag,
    name: row.name,
    status: {
      name: row.status_name,
      colorCode: row.status_color,
    },
    school: { name: row.school_name },
    municipality: { name: row.municipality_name },
    location: row.location,
    qrCode: row.qr_code,
    verified: true,
  };
}

async function getAssetQr(user, id) {
  const row = await assetRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Asset not found');
  }
  return {
    assetTag: row.asset_tag,
    qrCode: row.qr_code,
  };
}

async function ensureReferences({ categoryId, schoolId, statusId }) {
  const [category, school, status] = await Promise.all([
    categoryId ? assetRepository.findCategory(categoryId) : Promise.resolve(null),
    schoolId ? assetRepository.findSchool(schoolId) : Promise.resolve(null),
    statusId ? assetRepository.findStatus(statusId) : Promise.resolve(null),
  ]);

  if (categoryId && (!category || category.is_active === false)) {
    throw AppError.badRequest('Invalid categoryId');
  }
  if (schoolId && (!school || school.is_active === false)) {
    throw AppError.notFound('School not found');
  }
  if (statusId && !status) {
    throw AppError.badRequest('Invalid statusId');
  }

  return { category, school, status };
}

async function createAsset(user, body) {
  const { category, school, status } = await ensureReferences({
    categoryId: body.categoryId,
    schoolId: body.schoolId,
    statusId: body.statusId,
  });

  assertCanWriteSchool(user, school);

  const created = await db.withTransaction(async (client) => {
    const assetTag = await assetRepository.generateTagForSchool(client, school.id);
    const qrCode = await assetRepository.generateQrCode(client, assetTag);
    const inserted = await assetRepository.insert(client, {
      asset_tag: assetTag,
      name: body.name.trim(),
      category_id: category.id,
      school_id: school.id,
      status_id: status.id,
      department: body.department || category.department || null,
      location: body.location || null,
      purchase_date: body.purchaseDate || null,
      purchase_cost: body.purchaseCost ?? 0,
      warranty_expiry: body.warrantyExpiry || null,
      vendor: body.vendor || null,
      qr_code: qrCode,
      notes: body.notes || null,
      created_by: user.id,
    });

    await assetRepository.insertHistory(client, {
      asset_id: inserted.id,
      action: 'created',
      new_value: assetTag,
      changed_by: user.id,
      notes: 'Asset registered',
    });

    return inserted.id;
  });

  return getAsset(user, created);
}

function valuesEqual(left, right) {
  if (left == null && right == null) {
    return true;
  }
  return String(left ?? '') === String(right ?? '');
}

async function updateAsset(user, id, body) {
  const current = await assetRepository.findById(user, id);
  if (!current) {
    throw AppError.notFound('Asset not found');
  }

  const nextSchoolId = body.schoolId || current.school_id;
  const refs = await ensureReferences({
    categoryId: body.categoryId,
    schoolId: body.schoolId,
    statusId: body.statusId,
  });

  const targetSchool = refs.school || { id: current.school_id, municipality_id: current.municipality_id };
  assertCanWriteSchool(user, { id: current.school_id });
  if (body.schoolId) {
    assertCanWriteSchool(user, targetSchool);
  }

  const next = {
    name: body.name !== undefined ? body.name.trim() : current.name,
    category_id: body.categoryId || current.category_id,
    school_id: nextSchoolId,
    status_id: body.statusId || current.status_id,
    department: body.department !== undefined ? body.department : current.department,
    location: body.location !== undefined ? body.location : current.location,
    purchase_date: body.purchaseDate !== undefined ? body.purchaseDate : formatDate(current.purchase_date),
    purchase_cost: body.purchaseCost !== undefined ? body.purchaseCost : Number(current.purchase_cost),
    warranty_expiry: body.warrantyExpiry !== undefined ? body.warrantyExpiry : formatDate(current.warranty_expiry),
    vendor: body.vendor !== undefined ? body.vendor : current.vendor,
    notes: body.notes !== undefined ? body.notes : current.notes,
  };

  const comparisons = [
    { column: 'name', field: 'name', oldValue: current.name, newValue: next.name },
    {
      column: 'category_id',
      field: 'categoryId',
      oldValue: current.category_name,
      newValue: refs.category ? refs.category.name : current.category_name,
      rawOld: current.category_id,
      rawNew: next.category_id,
    },
    {
      column: 'school_id',
      field: 'schoolId',
      oldValue: current.school_name,
      newValue: refs.school ? refs.school.name : current.school_name,
      rawOld: current.school_id,
      rawNew: next.school_id,
    },
    {
      column: 'status_id',
      field: 'statusId',
      oldValue: current.status_name,
      newValue: refs.status ? refs.status.name : current.status_name,
      rawOld: current.status_id,
      rawNew: next.status_id,
    },
    { column: 'department', field: 'department', oldValue: current.department, newValue: next.department },
    { column: 'location', field: 'location', oldValue: current.location, newValue: next.location },
    { column: 'purchase_date', field: 'purchaseDate', oldValue: formatDate(current.purchase_date), newValue: next.purchase_date },
    { column: 'purchase_cost', field: 'purchaseCost', oldValue: Number(current.purchase_cost), newValue: Number(next.purchase_cost) },
    { column: 'warranty_expiry', field: 'warrantyExpiry', oldValue: formatDate(current.warranty_expiry), newValue: next.warranty_expiry },
    { column: 'vendor', field: 'vendor', oldValue: current.vendor, newValue: next.vendor },
    { column: 'notes', field: 'notes', oldValue: current.notes, newValue: next.notes },
  ];

  const changed = comparisons.filter((item) => !valuesEqual(item.rawOld ?? item.oldValue, item.rawNew ?? item.newValue));
  if (changed.length === 0) {
    return getAsset(user, id);
  }

  const fields = {};
  changed.forEach((item) => {
    fields[item.column] = next[item.column];
  });

  await db.withTransaction(async (client) => {
    await assetRepository.update(client, id, fields);

    for (const item of changed) {
      const action = item.column === 'status_id' ? 'status_changed' : 'updated';
      await assetRepository.insertHistory(client, {
        asset_id: id,
        action,
        field_name: item.field,
        old_value: item.oldValue == null ? null : String(item.oldValue),
        new_value: item.newValue == null ? null : String(item.newValue),
        changed_by: user.id,
      });
    }
  });

  return getAsset(user, id);
}

async function deleteAsset(user, id) {
  const current = await assetRepository.findById(user, id);
  if (!current) {
    throw AppError.notFound('Asset not found');
  }
  assertCanWriteSchool(user, { id: current.school_id });

  const deleted = await db.withTransaction(async (client) => {
    const row = await assetRepository.softDelete(client, id);
    if (!row) {
      throw AppError.notFound('Asset not found');
    }
    await assetRepository.insertHistory(client, {
      asset_id: id,
      action: 'deleted',
      old_value: current.asset_tag,
      changed_by: user.id,
      notes: 'Asset soft deleted',
    });
    return row;
  });

  return {
    id: deleted.id,
    deletedAt: deleted.deleted_at,
  };
}

async function listHistory(user, id, query) {
  const asset = await assetRepository.findById(user, id);
  if (!asset) {
    throw AppError.notFound('Asset not found');
  }

  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await assetRepository.listHistory(id, {
    action: query.action,
    limit,
    offset,
  });

  return {
    data: rows.map(toHistoryDto),
    meta: buildMeta(page, limit, total),
  };
}

module.exports = {
  listAssets,
  getAsset,
  verifyAsset,
  getAssetQr,
  createAsset,
  updateAsset,
  deleteAsset,
  listHistory,
};

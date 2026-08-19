const db = require('../config/database');
const { buildAssetScope } = require('../utils/scope');

const ASSET_FROM = `
  FROM assets a
  INNER JOIN asset_categories ac ON ac.id = a.category_id
  INNER JOIN asset_statuses ast ON ast.id = a.status_id
  INNER JOIN schools s ON s.id = a.school_id
  INNER JOIN municipalities m ON m.id = s.municipality_id
  LEFT JOIN users u ON u.id = a.created_by
`;

const ASSET_SELECT = `
  SELECT
    a.id,
    a.asset_tag,
    a.name,
    a.department,
    a.location,
    a.purchase_date,
    a.purchase_cost,
    a.warranty_expiry,
    a.vendor,
    a.qr_code,
    a.notes,
    a.deleted_at,
    a.created_at,
    a.updated_at,
    ac.id AS category_id,
    ac.name AS category_name,
    ac.department AS category_department,
    ast.id AS status_id,
    ast.name AS status_name,
    ast.slug AS status_slug,
    ast.color_code AS status_color,
    s.id AS school_id,
    s.name AS school_name,
    s.school_code,
    m.id AS municipality_id,
    m.name AS municipality_name,
    m.code AS municipality_code,
    u.id AS created_by_id,
    u.full_name AS created_by_name
  ${ASSET_FROM}
`;

function appendFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.schoolId) {
    clauses.push(`a.school_id = $${index}`);
    params.push(filters.schoolId);
    index += 1;
  }

  if (filters.categoryId) {
    clauses.push(`a.category_id = $${index}`);
    params.push(filters.categoryId);
    index += 1;
  }

  if (filters.statusId) {
    clauses.push(`a.status_id = $${index}`);
    params.push(filters.statusId);
    index += 1;
  }

  if (filters.department) {
    clauses.push(`a.department ILIKE $${index}`);
    params.push(filters.department);
    index += 1;
  }

  if (filters.purchaseDateFrom) {
    clauses.push(`a.purchase_date >= $${index}`);
    params.push(filters.purchaseDateFrom);
    index += 1;
  }

  if (filters.purchaseDateTo) {
    clauses.push(`a.purchase_date <= $${index}`);
    params.push(filters.purchaseDateTo);
    index += 1;
  }

  if (filters.search) {
    clauses.push(
      `(a.name ILIKE $${index} OR a.asset_tag ILIKE $${index} OR a.vendor ILIKE $${index} OR a.location ILIKE $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list(user, filters) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = appendFilters(filters, params, scope.nextIndex);
  const where = ['a.deleted_at IS NULL', scope.clause, ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM assets a
     INNER JOIN schools s ON s.id = a.school_id
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${ASSET_SELECT}
     WHERE ${where}
     ORDER BY ${filters.sqlColumn} ${filters.order}, a.id DESC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function findById(user, id, { includeDeleted = false } = {}) {
  const scope = buildAssetScope(user, 2);
  const deletedClause = includeDeleted ? '1=1' : 'a.deleted_at IS NULL';
  const result = await db.query(
    `${ASSET_SELECT}
     WHERE a.id = $1
       AND ${deletedClause}
       AND ${scope.clause}
     LIMIT 1`,
    [id, ...scope.params]
  );
  return result.rows[0] || null;
}

async function findByTag(tag) {
  const result = await db.query(
    `${ASSET_SELECT}
     WHERE a.asset_tag = $1
       AND a.deleted_at IS NULL
     LIMIT 1`,
    [tag]
  );
  return result.rows[0] || null;
}

async function generateTagForSchool(client, schoolId) {
  const result = await client.query('SELECT generate_asset_tag_for_school($1) AS asset_tag', [schoolId]);
  return result.rows[0].asset_tag;
}

async function generateQrCode(client, assetTag) {
  const result = await client.query('SELECT default_qr_code($1) AS qr_code', [assetTag]);
  return result.rows[0].qr_code;
}

async function insert(client, payload) {
  const result = await client.query(
    `INSERT INTO assets (
        asset_tag, name, category_id, school_id, status_id,
        department, location, purchase_date, purchase_cost,
        warranty_expiry, vendor, qr_code, notes, created_by
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [
      payload.asset_tag,
      payload.name,
      payload.category_id,
      payload.school_id,
      payload.status_id,
      payload.department,
      payload.location,
      payload.purchase_date,
      payload.purchase_cost,
      payload.warranty_expiry,
      payload.vendor,
      payload.qr_code,
      payload.notes,
      payload.created_by,
    ]
  );
  return result.rows[0];
}

async function update(client, id, fields) {
  const assignments = [];
  const params = [];
  let index = 1;

  Object.entries(fields).forEach(([column, value]) => {
    assignments.push(`${column} = $${index}`);
    params.push(value);
    index += 1;
  });

  if (assignments.length === 0) {
    return;
  }

  params.push(id);
  await client.query(
    `UPDATE assets
     SET ${assignments.join(', ')}
     WHERE id = $${index}
       AND deleted_at IS NULL`,
    params
  );
}

async function softDelete(client, id) {
  const result = await client.query(
    `UPDATE assets
     SET deleted_at = NOW()
     WHERE id = $1
       AND deleted_at IS NULL
     RETURNING id, deleted_at`,
    [id]
  );
  return result.rows[0] || null;
}

async function insertHistory(client, payload) {
  await client.query(
    `INSERT INTO asset_history (
        asset_id, action, field_name, old_value, new_value, changed_by, notes, metadata
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
    [
      payload.asset_id,
      payload.action,
      payload.field_name || null,
      payload.old_value ?? null,
      payload.new_value ?? null,
      payload.changed_by || null,
      payload.notes || null,
      JSON.stringify(payload.metadata || {}),
    ]
  );
}

async function listHistory(assetId, { action, limit, offset }) {
  const params = [assetId];
  const clauses = ['h.asset_id = $1'];
  let index = 2;

  if (action) {
    clauses.push(`h.action = $${index}`);
    params.push(action);
    index += 1;
  }

  const where = clauses.join(' AND ');
  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM asset_history h WHERE ${where}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await db.query(
    `SELECT
        h.id,
        h.action,
        h.field_name,
        h.old_value,
        h.new_value,
        h.notes,
        h.created_at,
        u.id AS changed_by_id,
        u.full_name AS changed_by_name
     FROM asset_history h
     LEFT JOIN users u ON u.id = h.changed_by
     WHERE ${where}
     ORDER BY h.created_at DESC
     LIMIT $${index} OFFSET $${index + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function listRecentHistory(assetId, limit = 5) {
  const result = await db.query(
    `SELECT
        h.id,
        h.action,
        h.field_name,
        h.old_value,
        h.new_value,
        h.notes,
        h.created_at,
        u.id AS changed_by_id,
        u.full_name AS changed_by_name
     FROM asset_history h
     LEFT JOIN users u ON u.id = h.changed_by
     WHERE h.asset_id = $1
     ORDER BY h.created_at DESC
     LIMIT $2`,
    [assetId, limit]
  );
  return result.rows;
}

async function findSchool(schoolId) {
  const result = await db.query(
    `SELECT s.id, s.name, s.municipality_id, s.is_active
     FROM schools s
     WHERE s.id = $1`,
    [schoolId]
  );
  return result.rows[0] || null;
}

async function findCategory(categoryId) {
  const result = await db.query(
    `SELECT id, name, department, is_active
     FROM asset_categories
     WHERE id = $1`,
    [categoryId]
  );
  return result.rows[0] || null;
}

async function findStatus(statusId) {
  const result = await db.query(
    `SELECT id, name, slug
     FROM asset_statuses
     WHERE id = $1`,
    [statusId]
  );
  return result.rows[0] || null;
}

async function findStatusBySlug(slug) {
  const result = await db.query(
    `SELECT id, name, slug
     FROM asset_statuses
     WHERE slug = $1
     LIMIT 1`,
    [slug]
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
  findByTag,
  generateTagForSchool,
  generateQrCode,
  insert,
  update,
  softDelete,
  insertHistory,
  listHistory,
  listRecentHistory,
  findSchool,
  findCategory,
  findStatus,
  findStatusBySlug,
};

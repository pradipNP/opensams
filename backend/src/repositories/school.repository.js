const db = require('../config/database');
const { buildSchoolScope } = require('../utils/scope');

const SCHOOL_LIST_SELECT = `
  SELECT
    s.id,
    s.name,
    s.school_code,
    s.school_type,
    s.address,
    s.municipality_id,
    s.is_active,
    s.created_at,
    s.updated_at,
    m.name AS municipality_name,
    m.code AS municipality_code,
    (
      SELECT COUNT(*)::int
      FROM assets a
      WHERE a.school_id = s.id
        AND a.deleted_at IS NULL
    ) AS asset_count
  FROM schools s
  INNER JOIN municipalities m ON m.id = s.municipality_id
`;

function appendFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.schoolType) {
    clauses.push(`s.school_type ILIKE $${index}`);
    params.push(filters.schoolType);
    index += 1;
  }

  if (filters.search) {
    clauses.push(`(s.name ILIKE $${index} OR s.school_code ILIKE $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list(user, { municipalityId, search, schoolType, limit, offset }) {
  const scope = buildSchoolScope(user);
  const params = [...scope.params];
  const extra = appendFilters({ municipalityId, search, schoolType }, params, scope.nextIndex);
  const where = [scope.clause, ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM schools s
     WHERE ${where}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await db.query(
    `${SCHOOL_LIST_SELECT}
     WHERE ${where}
     ORDER BY s.name ASC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function findById(user, id) {
  const scope = buildSchoolScope(user, 2);
  const result = await db.query(
    `SELECT
        s.id,
        s.name,
        s.school_code,
        s.school_type,
        s.address,
        s.is_active,
        s.created_at,
        s.updated_at,
        m.id AS municipality_id,
        m.name AS municipality_name,
        m.code AS municipality_code,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL)::int AS total_assets,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL AND ast.slug = 'active')::int AS active_assets,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL AND ast.slug = 'damaged')::int AS damaged_assets,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL AND ast.slug = 'under_maintenance')::int AS under_maintenance,
        COALESCE(SUM(a.purchase_cost) FILTER (WHERE a.deleted_at IS NULL), 0)::numeric AS total_value
     FROM schools s
     INNER JOIN municipalities m ON m.id = s.municipality_id
     LEFT JOIN assets a ON a.school_id = s.id
     LEFT JOIN asset_statuses ast ON ast.id = a.status_id
     WHERE s.id = $1
       AND ${scope.clause}
     GROUP BY s.id, m.id`,
    [id, ...scope.params]
  );

  return result.rows[0] || null;
}

async function findRawById(id) {
  const result = await db.query(
    `SELECT
        s.id,
        s.name,
        s.school_code,
        s.school_type,
        s.address,
        s.municipality_id,
        s.is_active
     FROM schools s
     WHERE s.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByCode(schoolCode, excludeId) {
  const params = [schoolCode];
  let sql = `
    SELECT id
    FROM schools
    WHERE LOWER(school_code) = LOWER($1)
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $2';
  }
  sql += ' LIMIT 1';
  const result = await db.query(sql, params);
  return result.rows[0] || null;
}

async function insert({ name, school_code, school_type, municipality_id, address }) {
  const result = await db.query(
    `INSERT INTO schools (name, school_code, school_type, municipality_id, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [name, school_code, school_type, municipality_id, address]
  );
  return result.rows[0];
}

async function update(id, { name, school_code, school_type, municipality_id, address, is_active }) {
  const result = await db.query(
    `UPDATE schools
     SET
       name = $2,
       school_code = $3,
       school_type = $4,
       municipality_id = $5,
       address = $6,
       is_active = $7
     WHERE id = $1
     RETURNING id`,
    [id, name, school_code, school_type, municipality_id, address, is_active]
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
  findRawById,
  findByCode,
  insert,
  update,
};

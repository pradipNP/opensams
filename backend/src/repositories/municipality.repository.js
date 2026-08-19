const db = require('../config/database');
const { buildMunicipalityScope } = require('../utils/scope');

const MUNICIPALITY_SELECT = `
  SELECT
    m.id,
    m.name,
    m.code,
    m.district,
    m.province_id,
    m.is_active,
    m.created_at,
    m.updated_at,
    p.name AS province_name,
    (
      SELECT COUNT(*)::int
      FROM schools s
      WHERE s.municipality_id = m.id
    ) AS school_count,
    (
      SELECT COUNT(*)::int
      FROM assets a
      INNER JOIN schools s ON s.id = a.school_id
      WHERE s.municipality_id = m.id
        AND a.deleted_at IS NULL
    ) AS asset_count
  FROM municipalities m
  INNER JOIN provinces p ON p.id = m.province_id
`;

function appendFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.provinceId) {
    clauses.push(`m.province_id = $${index}`);
    params.push(filters.provinceId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(`(m.name ILIKE $${index} OR m.code ILIKE $${index} OR m.district ILIKE $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list(user, { provinceId, search, limit, offset }) {
  const scope = buildMunicipalityScope(user);
  const params = [...scope.params];
  const extra = appendFilters({ provinceId, search }, params, scope.nextIndex);
  const where = [scope.clause, ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM municipalities m
     WHERE ${where}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await db.query(
    `${MUNICIPALITY_SELECT}
     WHERE ${where}
     ORDER BY m.name ASC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function findById(user, id) {
  const scope = buildMunicipalityScope(user, 2);
  const result = await db.query(
    `${MUNICIPALITY_SELECT}
     WHERE m.id = $1
       AND ${scope.clause}
     LIMIT 1`,
    [id, ...scope.params]
  );

  return result.rows[0] || null;
}

async function findByName(name, excludeId) {
  const params = [name];
  let sql = `
    SELECT id
    FROM municipalities
    WHERE LOWER(name) = LOWER($1)
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $2';
  }
  sql += ' LIMIT 1';
  const result = await db.query(sql, params);
  return result.rows[0] || null;
}

async function findByCode(code, excludeId) {
  const params = [code];
  let sql = `
    SELECT id
    FROM municipalities
    WHERE LOWER(code) = LOWER($1)
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $2';
  }
  sql += ' LIMIT 1';
  const result = await db.query(sql, params);
  return result.rows[0] || null;
}

async function insert({ name, code, province_id, district }) {
  const result = await db.query(
    `INSERT INTO municipalities (name, code, province_id, district)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [name, code, province_id, district]
  );
  return result.rows[0];
}

async function update(id, { name, code, province_id, district, is_active }) {
  const result = await db.query(
    `UPDATE municipalities
     SET
       name = $2,
       code = $3,
       province_id = $4,
       district = $5,
       is_active = $6
     WHERE id = $1
     RETURNING id`,
    [id, name, code, province_id, district, is_active]
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
  findByName,
  findByCode,
  insert,
  update,
};

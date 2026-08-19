const db = require('../config/database');

const CATEGORY_SELECT = `
  SELECT
    c.id,
    c.name,
    c.department,
    c.description,
    c.is_active,
    c.created_at,
    COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL)::int AS asset_count
  FROM asset_categories c
  LEFT JOIN assets a ON a.category_id = c.id
`;

function appendFilters(filters, params, startIndex = 1) {
  const clauses = [];
  let index = startIndex;

  if (filters.department) {
    clauses.push(`c.department ILIKE $${index}`);
    params.push(filters.department);
    index += 1;
  }

  if (filters.search) {
    clauses.push(
      `(c.name ILIKE $${index} OR c.department ILIKE $${index} OR COALESCE(c.description, '') ILIKE $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list({ department, search } = {}) {
  const params = [];
  const extra = appendFilters({ department, search }, params);
  const where = extra.clauses.length > 0 ? `WHERE ${extra.clauses.join(' AND ')}` : '';

  const result = await db.query(
    `${CATEGORY_SELECT}
     ${where}
     GROUP BY c.id
     ORDER BY c.name ASC`,
    params
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `${CATEGORY_SELECT}
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByName(name, excludeId) {
  const params = [name];
  let sql = `
    SELECT id
    FROM asset_categories
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

async function insert({ name, department, description }) {
  const result = await db.query(
    `INSERT INTO asset_categories (name, department, description)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [name, department, description]
  );
  return result.rows[0];
}

async function update(id, { name, department, description, is_active }) {
  const result = await db.query(
    `UPDATE asset_categories
     SET
       name = $2,
       department = $3,
       description = $4,
       is_active = $5
     WHERE id = $1
     RETURNING id`,
    [id, name, department, description, is_active]
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
  findByName,
  insert,
  update,
};

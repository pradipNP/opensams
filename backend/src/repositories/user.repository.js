const db = require('../config/database');

const USER_SELECT = `
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.full_name,
    u.is_active,
    u.last_login_at,
    u.province_id,
    u.municipality_id,
    u.school_id,
    u.role_id,
    u.created_at,
    u.updated_at,
    r.name AS role_name,
    r.slug AS role_slug,
    r.permissions
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

function appendFilters(filters, params, startIndex = 1) {
  const clauses = [];
  let index = startIndex;

  if (filters.role) {
    clauses.push(`r.slug = $${index}`);
    params.push(filters.role);
    index += 1;
  }

  if (filters.municipalityId) {
    clauses.push(`u.municipality_id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.schoolId) {
    clauses.push(`u.school_id = $${index}`);
    params.push(filters.schoolId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(`(u.email ILIKE $${index} OR u.full_name ILIKE $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  if (filters.isActive !== undefined) {
    clauses.push(`u.is_active = $${index}`);
    params.push(filters.isActive);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function findByEmail(email) {
  const result = await db.query(
    `${USER_SELECT}
     WHERE LOWER(u.email) = LOWER($1)
     LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `${USER_SELECT}
     WHERE u.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function list({ role, municipalityId, schoolId, search, isActive, limit, offset }) {
  const params = [];
  const extra = appendFilters({ role, municipalityId, schoolId, search, isActive }, params);
  const where = extra.clauses.length > 0 ? `WHERE ${extra.clauses.join(' AND ')}` : '';

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     ${where}`,
    params
  );

  const listParams = [...params, limit, offset];
  const result = await db.query(
    `${USER_SELECT}
     ${where}
     ORDER BY u.created_at DESC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function findRoleBySlug(slug) {
  const result = await db.query(
    `SELECT id, name, slug, permissions
     FROM roles
     WHERE slug = $1
     LIMIT 1`,
    [slug]
  );
  return result.rows[0] || null;
}

async function countActiveStateAdmins() {
  const result = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE r.slug = 'state_admin'
       AND u.is_active = TRUE`
  );
  return result.rows[0]?.total || 0;
}

async function insert({
  role_id,
  province_id,
  municipality_id,
  school_id,
  email,
  password_hash,
  full_name,
}) {
  const result = await db.query(
    `INSERT INTO users (
        role_id, province_id, municipality_id, school_id, email, password_hash, full_name
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [role_id, province_id, municipality_id, school_id, email, password_hash, full_name]
  );
  return result.rows[0];
}

async function update(id, {
  role_id,
  province_id,
  municipality_id,
  school_id,
  email,
  password_hash,
  full_name,
  is_active,
}) {
  const result = await db.query(
    `UPDATE users
     SET
       role_id = $2,
       province_id = $3,
       municipality_id = $4,
       school_id = $5,
       email = $6,
       password_hash = $7,
       full_name = $8,
       is_active = $9
     WHERE id = $1
     RETURNING id`,
    [id, role_id, province_id, municipality_id, school_id, email, password_hash, full_name, is_active]
  );
  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await db.query(
    `UPDATE users
     SET is_active = FALSE
     WHERE id = $1
     RETURNING id, is_active`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateLastLogin(id) {
  const result = await db.query(
    `UPDATE users
     SET last_login_at = NOW()
     WHERE id = $1
     RETURNING last_login_at`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  list,
  findRoleBySlug,
  countActiveStateAdmins,
  insert,
  update,
  deactivate,
  updateLastLogin,
};

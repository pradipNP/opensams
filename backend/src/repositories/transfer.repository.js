const db = require('../config/database');
const { buildTransferScope } = require('../utils/scope');

const TRANSFER_FROM = `
  FROM asset_transfers t
  INNER JOIN assets a ON a.id = t.asset_id
  INNER JOIN asset_statuses ast ON ast.id = a.status_id
  INNER JOIN schools from_s ON from_s.id = t.from_school_id
  INNER JOIN municipalities from_m ON from_m.id = from_s.municipality_id
  INNER JOIN schools to_s ON to_s.id = t.to_school_id
  INNER JOIN municipalities to_m ON to_m.id = to_s.municipality_id
  INNER JOIN users req ON req.id = t.requested_by
  LEFT JOIN users appr ON appr.id = t.approved_by
`;

const TRANSFER_SELECT = `
  SELECT
    t.id,
    t.asset_id,
    t.from_school_id,
    t.to_school_id,
    t.requested_by,
    t.approved_by,
    t.status,
    t.transfer_date,
    t.reason,
    t.rejection_reason,
    t.notes,
    t.requested_at,
    t.approved_at,
    t.completed_at,
    t.created_at,
    t.updated_at,
    a.asset_tag,
    a.name AS asset_name,
    a.school_id AS asset_current_school_id,
    a.deleted_at AS asset_deleted_at,
    ast.slug AS asset_status_slug,
    ast.name AS asset_status_name,
    from_s.name AS from_school_name,
    from_s.school_code AS from_school_code,
    from_s.municipality_id AS from_municipality_id,
    from_m.name AS from_municipality_name,
    from_m.code AS from_municipality_code,
    to_s.name AS to_school_name,
    to_s.school_code AS to_school_code,
    to_s.municipality_id AS to_municipality_id,
    to_m.name AS to_municipality_name,
    to_m.code AS to_municipality_code,
    req.id AS requested_by_id,
    req.full_name AS requested_by_name,
    appr.id AS approved_by_id,
    appr.full_name AS approved_by_name
  ${TRANSFER_FROM}
`;

function appendFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.status) {
    clauses.push(`t.status = $${index}`);
    params.push(filters.status);
    index += 1;
  }

  if (filters.assetId) {
    clauses.push(`t.asset_id = $${index}`);
    params.push(filters.assetId);
    index += 1;
  }

  if (filters.schoolId) {
    clauses.push(`(t.from_school_id = $${index} OR t.to_school_id = $${index})`);
    params.push(filters.schoolId);
    index += 1;
  }

  if (filters.municipalityId) {
    clauses.push(`(from_s.municipality_id = $${index} OR to_s.municipality_id = $${index})`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(
      `(t.reason ILIKE $${index}
        OR a.asset_tag ILIKE $${index}
        OR a.name ILIKE $${index}
        OR from_s.name ILIKE $${index}
        OR to_s.name ILIKE $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list(user, filters) {
  const scope = buildTransferScope(user);
  const params = [...scope.params];
  const extra = appendFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, 'a.deleted_at IS NULL', ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     ${TRANSFER_FROM}
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${TRANSFER_SELECT}
     WHERE ${where}
     ORDER BY t.requested_at DESC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

async function findById(user, id) {
  const scope = buildTransferScope(user, 2);
  const result = await db.query(
    `${TRANSFER_SELECT}
     WHERE t.id = $1
       AND ${scope.clause}
     LIMIT 1`,
    [id, ...scope.params]
  );
  return result.rows[0] || null;
}

async function findSchoolById(id) {
  const result = await db.query(
    `SELECT
        s.id,
        s.name,
        s.school_code,
        s.is_active,
        s.municipality_id,
        m.name AS municipality_name,
        m.code AS municipality_code
     FROM schools s
     INNER JOIN municipalities m ON m.id = s.municipality_id
     WHERE s.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function countActiveForAsset(assetId, excludeId) {
  const params = [assetId];
  let sql = `
    SELECT COUNT(*)::int AS total
    FROM asset_transfers
    WHERE asset_id = $1
      AND status IN ('draft', 'pending', 'approved')
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $2';
  }
  const result = await db.query(sql, params);
  return result.rows[0]?.total || 0;
}

async function insert(client, payload) {
  const result = await client.query(
    `INSERT INTO asset_transfers (
        asset_id, from_school_id, to_school_id, requested_by,
        status, reason, notes, requested_at
     )
     VALUES ($1,$2,$3,$4,'pending',$5,$6,NOW())
     RETURNING id`,
    [
      payload.asset_id,
      payload.from_school_id,
      payload.to_school_id,
      payload.requested_by,
      payload.reason,
      payload.notes,
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
    `UPDATE asset_transfers
     SET ${assignments.join(', ')}
     WHERE id = $${index}`,
    params
  );
}

module.exports = {
  list,
  findById,
  findSchoolById,
  countActiveForAsset,
  insert,
  update,
};

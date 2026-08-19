const db = require('../config/database');
const { buildSchoolScope } = require('../utils/scope');

const MAINTENANCE_SELECT = `
  SELECT
    mr.id,
    mr.asset_id,
    mr.school_id,
    mr.status,
    mr.priority,
    mr.description,
    mr.estimated_cost,
    mr.actual_cost,
    mr.assigned_to,
    mr.requested_at,
    mr.approved_at,
    mr.started_at,
    mr.completed_at,
    mr.rejection_reason,
    mr.notes,
    mr.created_at,
    mr.updated_at,
    a.asset_tag,
    a.name AS asset_name,
    ast.slug AS asset_status_slug,
    ast.name AS asset_status_name,
    a.status_id AS asset_status_id,
    s.name AS school_name,
    s.school_code,
    s.municipality_id,
    req.id AS requested_by_id,
    req.full_name AS requested_by_name,
    appr.id AS approved_by_id,
    appr.full_name AS approved_by_name
  FROM maintenance_requests mr
  INNER JOIN assets a ON a.id = mr.asset_id
  INNER JOIN asset_statuses ast ON ast.id = a.status_id
  INNER JOIN schools s ON s.id = mr.school_id
  INNER JOIN users req ON req.id = mr.requested_by
  LEFT JOIN users appr ON appr.id = mr.approved_by
`;

function appendFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.status) {
    clauses.push(`mr.status = $${index}`);
    params.push(filters.status);
    index += 1;
  }

  if (filters.priority) {
    clauses.push(`mr.priority = $${index}`);
    params.push(filters.priority);
    index += 1;
  }

  if (filters.schoolId) {
    clauses.push(`mr.school_id = $${index}`);
    params.push(filters.schoolId);
    index += 1;
  }

  if (filters.assetId) {
    clauses.push(`mr.asset_id = $${index}`);
    params.push(filters.assetId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(
      `(mr.description ILIKE $${index} OR a.asset_tag ILIKE $${index} OR a.name ILIKE $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function list(user, filters) {
  const scope = buildSchoolScope(user);
  const params = [...scope.params];
  const extra = appendFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM maintenance_requests mr
     INNER JOIN assets a ON a.id = mr.asset_id
     INNER JOIN schools s ON s.id = mr.school_id
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${MAINTENANCE_SELECT}
     WHERE ${where}
     ORDER BY
       CASE mr.priority
         WHEN 'critical' THEN 1
         WHEN 'urgent' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         ELSE 4
       END,
       mr.requested_at DESC
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
    `${MAINTENANCE_SELECT}
     WHERE mr.id = $1
       AND ${scope.clause}
     LIMIT 1`,
    [id, ...scope.params]
  );
  return result.rows[0] || null;
}

async function countOpenForAsset(assetId, excludeId) {
  const params = [assetId];
  let sql = `
    SELECT COUNT(*)::int AS total
    FROM maintenance_requests
    WHERE asset_id = $1
      AND status IN ('pending', 'approved', 'in_progress')
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
    `INSERT INTO maintenance_requests (
        asset_id, school_id, requested_by, status, priority,
        description, estimated_cost, notes
     )
     VALUES ($1,$2,$3,'pending',$4,$5,$6,$7)
     RETURNING id`,
    [
      payload.asset_id,
      payload.school_id,
      payload.requested_by,
      payload.priority,
      payload.description,
      payload.estimated_cost,
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

  params.push(id);
  await client.query(
    `UPDATE maintenance_requests
     SET ${assignments.join(', ')}
     WHERE id = $${index}`,
    params
  );
}

module.exports = {
  list,
  findById,
  countOpenForAsset,
  insert,
  update,
};

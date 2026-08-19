const db = require('../config/database');
const { buildAssetScope, buildMunicipalityScope, buildSchoolScope, buildTransferScope } = require('../utils/scope');

const INVENTORY_FROM = `
  FROM assets a
  INNER JOIN asset_categories ac ON ac.id = a.category_id
  INNER JOIN asset_statuses ast ON ast.id = a.status_id
  INNER JOIN schools s ON s.id = a.school_id
  INNER JOIN municipalities m ON m.id = s.municipality_id
`;

const INVENTORY_SELECT = `
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
    a.created_at,
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
    m.code AS municipality_code
  ${INVENTORY_FROM}
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

async function listInventory(user, filters) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = appendFilters(filters, params, scope.nextIndex);
  const where = ['a.deleted_at IS NULL', scope.clause, ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     ${INVENTORY_FROM}
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${INVENTORY_SELECT}
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

function appendMunicipalityFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.municipalityId) {
    clauses.push(`m.id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(`(m.name ILIKE $${index} OR m.code ILIKE $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function listMunicipalityReport(user, filters) {
  const scope = buildMunicipalityScope(user);
  const params = [...scope.params];
  const extra = appendMunicipalityFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, 'm.is_active = TRUE', ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM municipalities m
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `SELECT
        m.id,
        m.name,
        m.code,
        m.province_id,
        p.name AS province_name,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = TRUE)::int AS total_schools,
        COUNT(a.id)::int AS total_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'active')::int AS active_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'damaged')::int AS damaged_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'under_maintenance')::int AS under_maintenance_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'disposed')::int AS disposed_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'lost')::int AS lost_assets,
        COALESCE(SUM(a.purchase_cost), 0)::numeric AS total_asset_value
     FROM municipalities m
     INNER JOIN provinces p ON p.id = m.province_id
     LEFT JOIN schools s ON s.municipality_id = m.id
     LEFT JOIN assets a ON a.school_id = s.id AND a.deleted_at IS NULL
     LEFT JOIN asset_statuses ast ON ast.id = a.status_id
     WHERE ${where}
     GROUP BY m.id, p.id, p.name
     ORDER BY m.name ASC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

function appendSchoolFilters(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;

  if (filters.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.schoolId) {
    clauses.push(`s.id = $${index}`);
    params.push(filters.schoolId);
    index += 1;
  }

  if (filters.search) {
    clauses.push(`(s.name ILIKE $${index} OR s.school_code ILIKE $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function listSchoolReport(user, filters) {
  const scope = buildSchoolScope(user);
  const params = [...scope.params];
  const extra = appendSchoolFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, 's.is_active = TRUE', ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM schools s
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `SELECT
        s.id,
        s.name,
        s.school_code,
        s.school_type,
        s.municipality_id,
        m.name AS municipality_name,
        m.code AS municipality_code,
        p.id AS province_id,
        p.name AS province_name,
        COUNT(a.id)::int AS total_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'active')::int AS active_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'damaged')::int AS damaged_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'under_maintenance')::int AS under_maintenance_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'disposed')::int AS disposed_assets,
        COUNT(a.id) FILTER (WHERE ast.slug = 'lost')::int AS lost_assets,
        COALESCE(SUM(a.purchase_cost), 0)::numeric AS total_asset_value
     FROM schools s
     INNER JOIN municipalities m ON m.id = s.municipality_id
     INNER JOIN provinces p ON p.id = m.province_id
     LEFT JOIN assets a ON a.school_id = s.id AND a.deleted_at IS NULL
     LEFT JOIN asset_statuses ast ON ast.id = a.status_id
     WHERE ${where}
     GROUP BY s.id, m.id, m.name, m.code, p.id, p.name
     ORDER BY s.name ASC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

const MAINTENANCE_REPORT_FROM = `
  FROM maintenance_requests mr
  INNER JOIN assets a ON a.id = mr.asset_id
  INNER JOIN schools s ON s.id = mr.school_id
  INNER JOIN municipalities m ON m.id = s.municipality_id
  INNER JOIN users req ON req.id = mr.requested_by
  LEFT JOIN users appr ON appr.id = mr.approved_by
`;

const MAINTENANCE_REPORT_SELECT = `
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
    mr.completed_at,
    mr.rejection_reason,
    mr.notes,
    mr.created_at,
    a.asset_tag,
    a.name AS asset_name,
    s.name AS school_name,
    s.school_code,
    m.id AS municipality_id,
    m.name AS municipality_name,
    m.code AS municipality_code,
    req.id AS requested_by_id,
    req.full_name AS requested_by_name,
    appr.id AS approved_by_id,
    appr.full_name AS approved_by_name
  ${MAINTENANCE_REPORT_FROM}
`;

function appendMaintenanceFilters(filters, params, startIndex) {
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

  if (filters.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(filters.municipalityId);
    index += 1;
  }

  if (filters.assetId) {
    clauses.push(`mr.asset_id = $${index}`);
    params.push(filters.assetId);
    index += 1;
  }

  if (filters.dateFrom) {
    clauses.push(`(mr.requested_at)::date >= $${index}`);
    params.push(filters.dateFrom);
    index += 1;
  }

  if (filters.dateTo) {
    clauses.push(`(mr.requested_at)::date <= $${index}`);
    params.push(filters.dateTo);
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

async function listMaintenanceReport(user, filters) {
  const scope = buildSchoolScope(user);
  const params = [...scope.params];
  const extra = appendMaintenanceFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, 'a.deleted_at IS NULL', ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     ${MAINTENANCE_REPORT_FROM}
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${MAINTENANCE_REPORT_SELECT}
     WHERE ${where}
     ORDER BY ${filters.sqlColumn} ${filters.order}, mr.id DESC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

const TRANSFER_REPORT_FROM = `
  FROM asset_transfers t
  INNER JOIN assets a ON a.id = t.asset_id
  INNER JOIN schools from_s ON from_s.id = t.from_school_id
  INNER JOIN municipalities from_m ON from_m.id = from_s.municipality_id
  INNER JOIN schools to_s ON to_s.id = t.to_school_id
  INNER JOIN municipalities to_m ON to_m.id = to_s.municipality_id
  INNER JOIN users req ON req.id = t.requested_by
  LEFT JOIN users appr ON appr.id = t.approved_by
`;

const TRANSFER_REPORT_SELECT = `
  SELECT
    t.id,
    t.asset_id,
    t.from_school_id,
    t.to_school_id,
    t.status,
    t.transfer_date,
    t.reason,
    t.rejection_reason,
    t.notes,
    t.requested_at,
    t.approved_at,
    t.completed_at,
    t.created_at,
    a.asset_tag,
    a.name AS asset_name,
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
  ${TRANSFER_REPORT_FROM}
`;

function appendTransferFilters(filters, params, startIndex) {
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

  if (filters.dateFrom) {
    clauses.push(`(t.requested_at)::date >= $${index}`);
    params.push(filters.dateFrom);
    index += 1;
  }

  if (filters.dateTo) {
    clauses.push(`(t.requested_at)::date <= $${index}`);
    params.push(filters.dateTo);
    index += 1;
  }

  if (filters.search) {
    clauses.push(
      `(t.reason ILIKE $${index}
        OR a.asset_tag ILIKE $${index}
        OR a.name ILIKE $${index}
        OR from_s.name ILIKE $${index}
        OR to_s.name ILIKE $${index}
        OR from_s.school_code ILIKE $${index}
        OR to_s.school_code ILIKE $${index}
        OR from_m.name ILIKE $${index}
        OR to_m.name ILIKE $${index}
        OR from_m.code ILIKE $${index}
        OR to_m.code ILIKE $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function listTransferReport(user, filters) {
  const scope = buildTransferScope(user);
  const params = [...scope.params];
  const extra = appendTransferFilters(filters, params, scope.nextIndex);
  const where = [scope.clause, 'a.deleted_at IS NULL', ...extra.clauses].join(' AND ');

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     ${TRANSFER_REPORT_FROM}
     WHERE ${where}`,
    params
  );

  const listParams = [...params, filters.limit, filters.offset];
  const result = await db.query(
    `${TRANSFER_REPORT_SELECT}
     WHERE ${where}
     ORDER BY ${filters.sqlColumn} ${filters.order}, t.id DESC
     LIMIT $${extra.nextIndex} OFFSET $${extra.nextIndex + 1}`,
    listParams
  );

  return {
    rows: result.rows,
    total: countResult.rows[0]?.total || 0,
  };
}

module.exports = {
  listInventory,
  listMunicipalityReport,
  listSchoolReport,
  listMaintenanceReport,
  listTransferReport,
};

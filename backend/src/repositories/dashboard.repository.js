const db = require('../config/database');
const { buildAssetScope, buildSchoolScope, buildTransferScope, buildMunicipalityScope } = require('../utils/scope');

function assetFrom() {
  return `
    FROM assets a
    INNER JOIN schools s ON s.id = a.school_id
  `;
}

function transferFrom() {
  return `
    FROM asset_transfers t
    INNER JOIN assets a ON a.id = t.asset_id
    INNER JOIN schools from_s ON from_s.id = t.from_school_id
    INNER JOIN schools to_s ON to_s.id = t.to_school_id
  `;
}

function combineWhere(scopeClause, extraClauses) {
  return [scopeClause, ...extraClauses].join(' AND ');
}

function extraAssetClauses(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;
  const extra = filters || {};

  if (extra.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(extra.municipalityId);
    index += 1;
  }

  if (extra.schoolId) {
    clauses.push(`a.school_id = $${index}`);
    params.push(extra.schoolId);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

function extraSchoolClauses(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;
  const extra = filters || {};

  if (extra.municipalityId) {
    clauses.push(`s.municipality_id = $${index}`);
    params.push(extra.municipalityId);
    index += 1;
  }

  if (extra.schoolId) {
    clauses.push(`s.id = $${index}`);
    params.push(extra.schoolId);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

function extraTransferClauses(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;
  const extra = filters || {};

  if (extra.municipalityId) {
    clauses.push(`(from_s.municipality_id = $${index} OR to_s.municipality_id = $${index})`);
    params.push(extra.municipalityId);
    index += 1;
  }

  if (extra.schoolId) {
    clauses.push(`(t.from_school_id = $${index} OR t.to_school_id = $${index})`);
    params.push(extra.schoolId);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

function extraMunicipalityClauses(filters, params, startIndex) {
  const clauses = [];
  let index = startIndex;
  const extra = filters || {};

  if (extra.municipalityId) {
    clauses.push(`m.id = $${index}`);
    params.push(extra.municipalityId);
    index += 1;
  }

  if (extra.schoolId) {
    clauses.push(`m.id = (SELECT municipality_id FROM schools WHERE id = $${index})`);
    params.push(extra.schoolId);
    index += 1;
  }

  return { clauses, nextIndex: index };
}

async function getKpis(user, filters = {}) {
  const assetScope = buildAssetScope(user);
  const schoolScope = buildSchoolScope(user);
  const transferScope = buildTransferScope(user);

  const assetParams = [...assetScope.params];
  const assetExtra = extraAssetClauses(filters, assetParams, assetScope.nextIndex);
  const assetWhere = combineWhere(assetScope.clause, assetExtra.clauses);

  const schoolParams = [...schoolScope.params];
  const schoolExtra = extraSchoolClauses(filters, schoolParams, schoolScope.nextIndex);
  const schoolWhere = combineWhere(schoolScope.clause, schoolExtra.clauses);

  const transferParams = [...transferScope.params];
  const transferExtra = extraTransferClauses(filters, transferParams, transferScope.nextIndex);
  const transferWhere = combineWhere(transferScope.clause, transferExtra.clauses);

  const [assetResult, schoolResult, maintenanceResult, transferResult] = await Promise.all([
    db.query(
      `SELECT
          COUNT(*)::int AS total_assets,
          COUNT(*) FILTER (WHERE ast.slug = 'active')::int AS active_assets,
          COUNT(*) FILTER (WHERE ast.slug = 'damaged')::int AS damaged_assets,
          COUNT(*) FILTER (WHERE ast.slug = 'under_maintenance')::int AS under_maintenance,
          COUNT(*) FILTER (WHERE ast.slug = 'disposed')::int AS disposed_assets,
          COUNT(*) FILTER (WHERE ast.slug = 'lost')::int AS lost_assets,
          COALESCE(SUM(a.purchase_cost), 0)::numeric AS total_asset_value
       ${assetFrom()}
       INNER JOIN asset_statuses ast ON ast.id = a.status_id
       WHERE a.deleted_at IS NULL
         AND ${assetWhere}`,
      assetParams
    ),
    db.query(
      `SELECT COUNT(*)::int AS total_schools
       FROM schools s
       WHERE s.is_active = TRUE
         AND ${schoolWhere}`,
      schoolParams
    ),
    db.query(
      `SELECT
          COUNT(*) FILTER (WHERE mr.status = 'pending')::int AS pending_maintenance,
          COUNT(*) FILTER (WHERE mr.status = 'completed')::int AS completed_maintenance
       FROM maintenance_requests mr
       INNER JOIN assets a ON a.id = mr.asset_id
       INNER JOIN schools s ON s.id = mr.school_id
       WHERE a.deleted_at IS NULL
         AND ${schoolWhere}`,
      schoolParams
    ),
    db.query(
      `SELECT
          COUNT(*) FILTER (WHERE t.status = 'pending')::int AS pending_transfers,
          COUNT(*) FILTER (WHERE t.status = 'approved')::int AS approved_transfers,
          COUNT(*) FILTER (WHERE t.status = 'completed')::int AS completed_transfers
       ${transferFrom()}
       WHERE a.deleted_at IS NULL
         AND ${transferWhere}`,
      transferParams
    ),
  ]);

  return {
    ...assetResult.rows[0],
    ...schoolResult.rows[0],
    ...maintenanceResult.rows[0],
    ...transferResult.rows[0],
  };
}

async function countMunicipalities(user, filters = {}) {
  const scope = buildMunicipalityScope(user);
  const params = [...scope.params];
  const extra = extraMunicipalityClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, ['m.is_active = TRUE', ...extra.clauses]);

  const result = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM municipalities m
     WHERE ${where}`,
    params
  );

  return result.rows[0]?.total || 0;
}

async function assetsByMunicipality(user, filters = {}) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = extraAssetClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, extra.clauses);

  const result = await db.query(
    `SELECT
        m.id,
        m.name,
        m.code,
        COUNT(a.id)::int AS value
     ${assetFrom()}
     INNER JOIN municipalities m ON m.id = s.municipality_id
     WHERE a.deleted_at IS NULL
       AND ${where}
     GROUP BY m.id, m.name, m.code
     ORDER BY value DESC, m.name ASC`,
    params
  );
  return result.rows;
}

async function assetValueByMunicipality(user, filters = {}) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = extraAssetClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, extra.clauses);

  const result = await db.query(
    `SELECT
        m.id,
        m.name,
        m.code,
        COALESCE(SUM(a.purchase_cost), 0)::numeric AS value
     ${assetFrom()}
     INNER JOIN municipalities m ON m.id = s.municipality_id
     WHERE a.deleted_at IS NULL
       AND ${where}
     GROUP BY m.id, m.name, m.code
     ORDER BY value DESC, m.name ASC`,
    params
  );
  return result.rows;
}

async function assetsBySchool(user, filters = {}) {
  const scope = buildSchoolScope(user);
  const params = [...scope.params];
  const extra = extraSchoolClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, ['s.is_active = TRUE', ...extra.clauses]);

  const result = await db.query(
    `SELECT
        s.id,
        s.name,
        s.school_code AS code,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL)::int AS value
     FROM schools s
     LEFT JOIN assets a ON a.school_id = s.id
     WHERE ${where}
     GROUP BY s.id, s.name, s.school_code
     ORDER BY value DESC, s.name ASC`,
    params
  );
  return result.rows;
}

async function assetsByCategory(user, filters = {}) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = extraAssetClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, extra.clauses);

  const result = await db.query(
    `SELECT
        ac.id,
        ac.name,
        ac.department,
        COUNT(a.id)::int AS value
     ${assetFrom()}
     INNER JOIN asset_categories ac ON ac.id = a.category_id
     WHERE a.deleted_at IS NULL
       AND ${where}
     GROUP BY ac.id, ac.name, ac.department
     ORDER BY value DESC, ac.name ASC`,
    params
  );
  return result.rows;
}

async function transfersByStatus(user, filters = {}) {
  const scope = buildTransferScope(user);
  const params = [...scope.params];
  const extra = extraTransferClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, ['a.deleted_at IS NULL', ...extra.clauses]);

  const result = await db.query(
    `SELECT
        t.status AS name,
        t.status AS slug,
        COUNT(*)::int AS value
     ${transferFrom()}
     WHERE ${where}
     GROUP BY t.status
     ORDER BY t.status ASC`,
    params
  );
  return result.rows;
}

async function assetsByStatus(user, filters = {}) {
  const scope = buildAssetScope(user);
  const params = [...scope.params];
  const extra = extraAssetClauses(filters, params, scope.nextIndex);
  const where = combineWhere(scope.clause, extra.clauses);

  const result = await db.query(
    `SELECT
        ast.id,
        ast.name,
        ast.slug,
        ast.color_code,
        ast.sort_order,
        COUNT(scoped.id)::int AS value
     FROM asset_statuses ast
     LEFT JOIN (
        SELECT a.id, a.status_id
        ${assetFrom()}
        WHERE a.deleted_at IS NULL
          AND ${where}
     ) scoped ON scoped.status_id = ast.id
     GROUP BY ast.id, ast.name, ast.slug, ast.color_code, ast.sort_order
     ORDER BY ast.sort_order ASC`,
    params
  );
  return result.rows;
}

module.exports = {
  getKpis,
  countMunicipalities,
  assetsByMunicipality,
  assetValueByMunicipality,
  assetsBySchool,
  assetsByCategory,
  assetsByStatus,
  transfersByStatus,
};

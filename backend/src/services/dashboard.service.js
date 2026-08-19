const dashboardRepository = require('../repositories/dashboard.repository');

function toKpiDto(row) {
  return {
    totalAssets: Number(row.total_assets || 0),
    activeAssets: Number(row.active_assets || 0),
    damagedAssets: Number(row.damaged_assets || 0),
    underMaintenance: Number(row.under_maintenance || 0),
    disposedAssets: Number(row.disposed_assets || 0),
    lostAssets: Number(row.lost_assets || 0),
    totalSchools: Number(row.total_schools || 0),
    totalAssetValue: Number(row.total_asset_value || 0),
    pendingMaintenance: Number(row.pending_maintenance || 0),
    completedMaintenance: Number(row.completed_maintenance || 0),
    pendingTransfers: Number(row.pending_transfers || 0),
    approvedTransfers: Number(row.approved_transfers || 0),
    completedTransfers: Number(row.completed_transfers || 0),
  };
}

const TRANSFER_STATUS_ORDER = ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];
const TRANSFER_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function toChartDto(rows, extras = []) {
  return {
    labels: rows.map((row) => row.name),
    values: rows.map((row) => Number(row.value || 0)),
    ...Object.fromEntries(
      extras.map((key) => [key === 'code' ? 'codes' : key, rows.map((row) => row[key] ?? null)])
    ),
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || row.slug || null,
      value: Number(row.value || 0),
    })),
  };
}

async function getKpis(user) {
  const row = await dashboardRepository.getKpis(user);
  return toKpiDto(row);
}

async function getMunicipalityChart(user) {
  const rows = await dashboardRepository.assetsByMunicipality(user);
  return toChartDto(rows, ['code']);
}

async function getSchoolChart(user) {
  const rows = await dashboardRepository.assetsBySchool(user);
  return toChartDto(rows, ['code']);
}

async function getCategoryChart(user) {
  const rows = await dashboardRepository.assetsByCategory(user);
  return {
    ...toChartDto(rows),
    departments: rows.map((row) => row.department),
  };
}

async function getStatusChart(user) {
  const rows = await dashboardRepository.assetsByStatus(user);
  return {
    ...toChartDto(rows),
    colors: rows.map((row) => row.color_code),
    slugs: rows.map((row) => row.slug),
  };
}

async function getValueByMunicipalityChart(user) {
  const rows = await dashboardRepository.assetValueByMunicipality(user);
  return toChartDto(rows, ['code']);
}

async function getTransferChart(user) {
  const rows = await dashboardRepository.transfersByStatus(user);
  const counts = Object.fromEntries(rows.map((row) => [row.slug || row.name, Number(row.value || 0)]));
  return {
    labels: TRANSFER_STATUS_ORDER.map((status) => TRANSFER_STATUS_LABELS[status]),
    values: TRANSFER_STATUS_ORDER.map((status) => counts[status] || 0),
  };
}

async function getOverview(user) {
  const [kpis, byMunicipality, bySchool, byCategory, byStatus, valueByMunicipality, transfers] = await Promise.all([
    getKpis(user),
    getMunicipalityChart(user),
    getSchoolChart(user),
    getCategoryChart(user),
    getStatusChart(user),
    getValueByMunicipalityChart(user),
    getTransferChart(user),
  ]);

  return {
    kpis,
    charts: {
      assetsByMunicipality: byMunicipality,
      assetsBySchool: bySchool,
      assetsByCategory: byCategory,
      assetStatusDistribution: byStatus,
      assetValueByMunicipality: valueByMunicipality,
      transfers,
    },
  };
}

module.exports = {
  getKpis,
  getMunicipalityChart,
  getSchoolChart,
  getCategoryChart,
  getStatusChart,
  getValueByMunicipalityChart,
  getTransferChart,
  getOverview,
};

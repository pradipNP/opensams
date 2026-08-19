const reportsRepository = require('../repositories/reports.repository');
const dashboardRepository = require('../repositories/dashboard.repository');
const { parsePagination, buildMeta, parseSort } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const AppError = require('../utils/AppError');
const { buildExcelBuffer } = require('../utils/excelExport');
const { buildPdfBuffer } = require('../utils/pdfExport');

const EXPORT_ROW_CAP = 5000;
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PDF_TYPE = 'application/pdf';

const MAINTENANCE_SORT_COLUMNS = {
  requested_at: 'mr.requested_at',
  approved_at: 'mr.approved_at',
  completed_at: 'mr.completed_at',
  priority: 'mr.priority',
  status: 'mr.status',
  estimated_cost: 'mr.estimated_cost',
  actual_cost: 'mr.actual_cost',
};

const TRANSFER_SORT_COLUMNS = {
  requested_at: 't.requested_at',
  approved_at: 't.approved_at',
  completed_at: 't.completed_at',
  status: 't.status',
  transfer_date: 't.transfer_date',
};

const TRANSFER_STATUS_ORDER = ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];
const TRANSFER_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

function paging(query, paginate) {
  if (paginate) {
    return parsePagination(query);
  }
  return { page: 1, limit: EXPORT_ROW_CAP, offset: 0 };
}

function assertExportCap(total) {
  if (total > EXPORT_ROW_CAP) {
    throw AppError.badRequest(
      `Export exceeds the maximum of ${EXPORT_ROW_CAP} rows (found ${total}). Apply tighter filters and try again.`
    );
  }
}

function scopeLabel(user) {
  if (user.role === ROLES.STATE_ADMIN) {
    return 'State Administrator — all records';
  }
  if (user.role === ROLES.MUNICIPAL_OFFICER) {
    return 'Municipal Officer — assigned municipality';
  }
  if (user.role === ROLES.SCHOOL_ADMIN) {
    return 'School Administrator — assigned school';
  }
  return user.role || 'unknown';
}

function generatedBy(user) {
  return [user.email, user.role].filter(Boolean).join(' / ');
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function exportFilename(reportType, format) {
  const ext = format === 'xlsx' ? 'xlsx' : 'pdf';
  return `sams-${reportType}-${fileStamp()}.${ext}`;
}

function toInventoryRow(row) {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    name: row.name,
    category: {
      id: row.category_id,
      name: row.category_name,
      department: row.category_department,
    },
    status: {
      id: row.status_id,
      name: row.status_name,
      slug: row.status_slug,
      colorCode: row.status_color,
    },
    schoolId: row.school_id,
    school: {
      id: row.school_id,
      name: row.school_name,
      schoolCode: row.school_code,
    },
    municipalityId: row.municipality_id,
    municipality: {
      id: row.municipality_id,
      name: row.municipality_name,
      code: row.municipality_code,
    },
    department: row.department,
    location: row.location,
    purchaseDate: formatDate(row.purchase_date),
    purchaseCost: Number(row.purchase_cost),
    warrantyExpiry: formatDate(row.warranty_expiry),
    vendor: row.vendor,
    qrCode: row.qr_code,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function getInventoryReport(user, query, options = {}) {
  const paginate = options.paginate !== false;
  const { page, limit, offset } = paging(query, paginate);
  const sort = parseSort(query);

  const { rows, total } = await reportsRepository.listInventory(user, {
    municipalityId: query.municipalityId,
    schoolId: query.schoolId,
    categoryId: query.categoryId,
    statusId: query.statusId,
    department: query.department?.trim() || undefined,
    purchaseDateFrom: query.purchaseDateFrom || undefined,
    purchaseDateTo: query.purchaseDateTo || undefined,
    search: query.search?.trim() || undefined,
    sqlColumn: sort.sqlColumn,
    order: sort.order,
    limit,
    offset,
  });

  if (!paginate) {
    assertExportCap(total);
  }

  return {
    data: rows.map(toInventoryRow),
    meta: buildMeta(page, limit, total),
  };
}

async function getMunicipalityReport(user, query, options = {}) {
  const paginate = options.paginate !== false;
  const { page, limit, offset } = paging(query, paginate);

  const { rows, total } = await reportsRepository.listMunicipalityReport(user, {
    municipalityId: query.municipalityId,
    search: query.search?.trim() || undefined,
    limit,
    offset,
  });

  if (!paginate) {
    assertExportCap(total);
  }

  return {
    data: rows.map(toMunicipalityRow),
    meta: buildMeta(page, limit, total),
  };
}

function toMunicipalityRow(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    provinceId: row.province_id,
    province: {
      id: row.province_id,
      name: row.province_name,
    },
    totalSchools: Number(row.total_schools || 0),
    totalAssets: Number(row.total_assets || 0),
    activeAssets: Number(row.active_assets || 0),
    damagedAssets: Number(row.damaged_assets || 0),
    underMaintenanceAssets: Number(row.under_maintenance_assets || 0),
    disposedAssets: Number(row.disposed_assets || 0),
    lostAssets: Number(row.lost_assets || 0),
    totalAssetValue: Number(row.total_asset_value || 0),
  };
}

async function getSchoolReport(user, query, options = {}) {
  const paginate = options.paginate !== false;
  const { page, limit, offset } = paging(query, paginate);

  const { rows, total } = await reportsRepository.listSchoolReport(user, {
    municipalityId: query.municipalityId,
    schoolId: query.schoolId,
    search: query.search?.trim() || undefined,
    limit,
    offset,
  });

  if (!paginate) {
    assertExportCap(total);
  }

  return {
    data: rows.map(toSchoolRow),
    meta: buildMeta(page, limit, total),
  };
}

function toSchoolRow(row) {
  return {
    id: row.id,
    name: row.name,
    schoolCode: row.school_code,
    schoolType: row.school_type,
    municipalityId: row.municipality_id,
    municipality: {
      id: row.municipality_id,
      name: row.municipality_name,
      code: row.municipality_code,
    },
    provinceId: row.province_id,
    province: {
      id: row.province_id,
      name: row.province_name,
    },
    totalAssets: Number(row.total_assets || 0),
    activeAssets: Number(row.active_assets || 0),
    damagedAssets: Number(row.damaged_assets || 0),
    underMaintenanceAssets: Number(row.under_maintenance_assets || 0),
    disposedAssets: Number(row.disposed_assets || 0),
    lostAssets: Number(row.lost_assets || 0),
    totalAssetValue: Number(row.total_asset_value || 0),
  };
}

function toMaintenanceRow(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    asset: {
      id: row.asset_id,
      assetTag: row.asset_tag,
      name: row.asset_name,
    },
    school: {
      id: row.school_id,
      name: row.school_name,
      schoolCode: row.school_code,
    },
    municipality: {
      id: row.municipality_id,
      name: row.municipality_name,
      code: row.municipality_code,
    },
    description: row.description,
    priority: row.priority,
    status: row.status,
    estimatedCost: row.estimated_cost == null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost == null ? null : Number(row.actual_cost),
    requestedBy: {
      id: row.requested_by_id,
      fullName: row.requested_by_name,
    },
    assignedTo: row.assigned_to,
    approvedBy: row.approved_by_id
      ? { id: row.approved_by_id, fullName: row.approved_by_name }
      : null,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    completedAt: row.completed_at,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function getMaintenanceReport(user, query, options = {}) {
  const paginate = options.paginate !== false;
  const { page, limit, offset } = paging(query, paginate);
  const sort = parseSort(query, MAINTENANCE_SORT_COLUMNS, 'requested_at');

  const { rows, total } = await reportsRepository.listMaintenanceReport(user, {
    status: query.status,
    priority: query.priority,
    schoolId: query.schoolId,
    municipalityId: query.municipalityId,
    assetId: query.assetId,
    search: query.search?.trim() || undefined,
    dateFrom: query.dateFrom || undefined,
    dateTo: query.dateTo || undefined,
    sqlColumn: sort.sqlColumn,
    order: sort.order,
    limit,
    offset,
  });

  if (!paginate) {
    assertExportCap(total);
  }

  return {
    data: rows.map(toMaintenanceRow),
    meta: buildMeta(page, limit, total),
  };
}

function toTransferRow(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    asset: {
      id: row.asset_id,
      assetTag: row.asset_tag,
      name: row.asset_name,
    },
    fromSchool: {
      id: row.from_school_id,
      name: row.from_school_name,
      schoolCode: row.from_school_code,
      municipality: {
        id: row.from_municipality_id,
        name: row.from_municipality_name,
        code: row.from_municipality_code,
      },
    },
    toSchool: {
      id: row.to_school_id,
      name: row.to_school_name,
      schoolCode: row.to_school_code,
      municipality: {
        id: row.to_municipality_id,
        name: row.to_municipality_name,
        code: row.to_municipality_code,
      },
    },
    status: row.status,
    reason: row.reason,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    transferDate: formatDate(row.transfer_date),
    requestedBy: {
      id: row.requested_by_id,
      fullName: row.requested_by_name,
    },
    approvedBy: row.approved_by_id
      ? { id: row.approved_by_id, fullName: row.approved_by_name }
      : null,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

async function getTransferReport(user, query, options = {}) {
  const paginate = options.paginate !== false;
  const { page, limit, offset } = paging(query, paginate);
  const sort = parseSort(query, TRANSFER_SORT_COLUMNS, 'requested_at');

  const { rows, total } = await reportsRepository.listTransferReport(user, {
    status: query.status,
    schoolId: query.schoolId,
    municipalityId: query.municipalityId,
    assetId: query.assetId,
    search: query.search?.trim() || undefined,
    dateFrom: query.dateFrom || undefined,
    dateTo: query.dateTo || undefined,
    sqlColumn: sort.sqlColumn,
    order: sort.order,
    limit,
    offset,
  });

  if (!paginate) {
    assertExportCap(total);
  }

  return {
    data: rows.map(toTransferRow),
    meta: buildMeta(page, limit, total),
  };
}

function toKpiDto(row, totalMunicipalities) {
  return {
    totalAssets: Number(row.total_assets || 0),
    activeAssets: Number(row.active_assets || 0),
    damagedAssets: Number(row.damaged_assets || 0),
    underMaintenance: Number(row.under_maintenance || 0),
    disposedAssets: Number(row.disposed_assets || 0),
    lostAssets: Number(row.lost_assets || 0),
    totalSchools: Number(row.total_schools || 0),
    totalMunicipalities: Number(totalMunicipalities || 0),
    totalAssetValue: Number(row.total_asset_value || 0),
    pendingMaintenance: Number(row.pending_maintenance || 0),
    completedMaintenance: Number(row.completed_maintenance || 0),
    pendingTransfers: Number(row.pending_transfers || 0),
    approvedTransfers: Number(row.approved_transfers || 0),
    completedTransfers: Number(row.completed_transfers || 0),
  };
}

function toCountItems(rows) {
  return rows.map((row) => ({
    id: row.id || null,
    name: row.name,
    code: row.code || row.slug || null,
    value: Number(row.value || 0),
  }));
}

async function getSummaryReport(user, query) {
  const filters = {
    municipalityId: query.municipalityId,
    schoolId: query.schoolId,
  };

  const [kpiRow, municipalityCount, byStatus, byCategory, byMunicipality, bySchool, transfers] = await Promise.all([
    dashboardRepository.getKpis(user, filters),
    dashboardRepository.countMunicipalities(user, filters),
    dashboardRepository.assetsByStatus(user, filters),
    dashboardRepository.assetsByCategory(user, filters),
    dashboardRepository.assetsByMunicipality(user, filters),
    dashboardRepository.assetsBySchool(user, filters),
    dashboardRepository.transfersByStatus(user, filters),
  ]);

  const transferCounts = Object.fromEntries(
    transfers.map((row) => [row.slug || row.name, Number(row.value || 0)])
  );

  return {
    data: {
      kpis: toKpiDto(kpiRow, municipalityCount),
      assetsByStatus: byStatus.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        colorCode: row.color_code,
        value: Number(row.value || 0),
      })),
      assetsByCategory: byCategory.map((row) => ({
        id: row.id,
        name: row.name,
        department: row.department,
        value: Number(row.value || 0),
      })),
      assetsByMunicipality: toCountItems(byMunicipality),
      assetsBySchool: toCountItems(bySchool),
      transfersByStatus: TRANSFER_STATUS_ORDER.map((status) => ({
        name: TRANSFER_STATUS_LABELS[status],
        slug: status,
        value: transferCounts[status] || 0,
      })),
    },
  };
}

const INVENTORY_COLUMNS = [
  { key: 'assetTag', header: 'Asset Tag', width: 16 },
  { key: 'name', header: 'Name', width: 18, wrap: true },
  { key: 'category', header: 'Category', width: 12 },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'school', header: 'School', width: 16, wrap: true },
  { key: 'municipality', header: 'Municipality', width: 14 },
  { key: 'department', header: 'Department', width: 12 },
  { key: 'location', header: 'Location', width: 10 },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date', width: 12 },
  { key: 'purchaseCost', header: 'Purchase Cost', type: 'number', width: 12 },
  { key: 'vendor', header: 'Vendor', width: 12 },
];

const INVENTORY_EXCEL_COLUMNS = [
  ...INVENTORY_COLUMNS,
  { key: 'warrantyExpiry', header: 'Warranty Expiry', type: 'date', width: 12 },
  { key: 'qrCode', header: 'QR Code', width: 18 },
  { key: 'notes', header: 'Notes', width: 20, wrap: true },
];

const MUNICIPALITY_COLUMNS = [
  { key: 'name', header: 'Municipality', width: 18 },
  { key: 'code', header: 'Code', width: 8 },
  { key: 'province', header: 'Province', width: 14 },
  { key: 'totalSchools', header: 'Schools', type: 'integer', width: 10 },
  { key: 'totalAssets', header: 'Assets', type: 'integer', width: 10 },
  { key: 'activeAssets', header: 'Active', type: 'integer', width: 10 },
  { key: 'damagedAssets', header: 'Damaged', type: 'integer', width: 10 },
  { key: 'underMaintenanceAssets', header: 'Under Maintenance', type: 'integer', width: 14 },
  { key: 'disposedAssets', header: 'Disposed', type: 'integer', width: 10 },
  { key: 'lostAssets', header: 'Lost', type: 'integer', width: 8 },
  { key: 'totalAssetValue', header: 'Total Value', type: 'number', width: 14 },
];

const SCHOOL_COLUMNS = [
  { key: 'name', header: 'School', width: 18, wrap: true },
  { key: 'schoolCode', header: 'Code', width: 10 },
  { key: 'schoolType', header: 'Type', width: 10 },
  { key: 'municipality', header: 'Municipality', width: 14 },
  { key: 'totalAssets', header: 'Assets', type: 'integer', width: 10 },
  { key: 'activeAssets', header: 'Active', type: 'integer', width: 10 },
  { key: 'damagedAssets', header: 'Damaged', type: 'integer', width: 10 },
  { key: 'underMaintenanceAssets', header: 'Under Maintenance', type: 'integer', width: 14 },
  { key: 'disposedAssets', header: 'Disposed', type: 'integer', width: 10 },
  { key: 'lostAssets', header: 'Lost', type: 'integer', width: 8 },
  { key: 'totalAssetValue', header: 'Total Value', type: 'number', width: 14 },
];

const MAINTENANCE_COLUMNS = [
  { key: 'assetTag', header: 'Asset Tag', width: 14 },
  { key: 'assetName', header: 'Asset', width: 14, wrap: true },
  { key: 'school', header: 'School', width: 14, wrap: true },
  { key: 'municipality', header: 'Municipality', width: 12 },
  { key: 'priority', header: 'Priority', width: 8 },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'description', header: 'Description', width: 18, wrap: true },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'number', width: 10 },
  { key: 'actualCost', header: 'Actual Cost', type: 'number', width: 10 },
  { key: 'requestedAt', header: 'Requested', type: 'datetime', width: 14 },
];

const TRANSFER_COLUMNS = [
  { key: 'assetTag', header: 'Asset Tag', width: 14 },
  { key: 'assetName', header: 'Asset', width: 12, wrap: true },
  { key: 'fromSchool', header: 'From School', width: 14, wrap: true },
  { key: 'toSchool', header: 'To School', width: 14, wrap: true },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'reason', header: 'Reason', width: 16, wrap: true },
  { key: 'requestedBy', header: 'Requested By', width: 12 },
  { key: 'requestedAt', header: 'Requested', type: 'datetime', width: 14 },
  { key: 'completedAt', header: 'Completed', type: 'datetime', width: 14 },
];

function flattenInventory(row) {
  return {
    assetTag: row.assetTag,
    name: row.name,
    category: row.category?.name,
    status: row.status?.name,
    school: `${row.school?.name || ''} (${row.school?.schoolCode || ''})`,
    municipality: `${row.municipality?.name || ''} (${row.municipality?.code || ''})`,
    department: row.department,
    location: row.location,
    purchaseDate: row.purchaseDate,
    purchaseCost: row.purchaseCost,
    warrantyExpiry: row.warrantyExpiry,
    vendor: row.vendor,
    qrCode: row.qrCode,
    notes: row.notes,
  };
}

function flattenMunicipality(row) {
  return {
    name: row.name,
    code: row.code,
    province: row.province?.name,
    totalSchools: row.totalSchools,
    totalAssets: row.totalAssets,
    activeAssets: row.activeAssets,
    damagedAssets: row.damagedAssets,
    underMaintenanceAssets: row.underMaintenanceAssets,
    disposedAssets: row.disposedAssets,
    lostAssets: row.lostAssets,
    totalAssetValue: row.totalAssetValue,
  };
}

function flattenSchool(row) {
  return {
    name: row.name,
    schoolCode: row.schoolCode,
    schoolType: row.schoolType,
    municipality: `${row.municipality?.name || ''} (${row.municipality?.code || ''})`,
    totalAssets: row.totalAssets,
    activeAssets: row.activeAssets,
    damagedAssets: row.damagedAssets,
    underMaintenanceAssets: row.underMaintenanceAssets,
    disposedAssets: row.disposedAssets,
    lostAssets: row.lostAssets,
    totalAssetValue: row.totalAssetValue,
  };
}

function flattenMaintenance(row) {
  return {
    assetTag: row.asset?.assetTag,
    assetName: row.asset?.name,
    school: `${row.school?.name || ''} (${row.school?.schoolCode || ''})`,
    municipality: `${row.municipality?.name || ''} (${row.municipality?.code || ''})`,
    priority: row.priority,
    status: row.status,
    description: row.description,
    estimatedCost: row.estimatedCost,
    actualCost: row.actualCost,
    requestedAt: row.requestedAt,
  };
}

function flattenTransfer(row) {
  return {
    assetTag: row.asset?.assetTag,
    assetName: row.asset?.name,
    fromSchool: `${row.fromSchool?.name || ''} (${row.fromSchool?.schoolCode || ''})`,
    toSchool: `${row.toSchool?.name || ''} (${row.toSchool?.schoolCode || ''})`,
    status: row.status,
    reason: row.reason,
    requestedBy: row.requestedBy?.fullName,
    requestedAt: row.requestedAt,
    completedAt: row.completedAt,
  };
}

function kpiItems(kpis) {
  return [
    { label: 'Total assets', value: kpis.totalAssets },
    { label: 'Active assets', value: kpis.activeAssets },
    { label: 'Damaged assets', value: kpis.damagedAssets },
    { label: 'Under maintenance', value: kpis.underMaintenance },
    { label: 'Disposed assets', value: kpis.disposedAssets },
    { label: 'Lost assets', value: kpis.lostAssets },
    { label: 'Total schools', value: kpis.totalSchools },
    { label: 'Total municipalities', value: kpis.totalMunicipalities },
    { label: 'Total asset value', value: kpis.totalAssetValue },
    { label: 'Pending maintenance', value: kpis.pendingMaintenance },
    { label: 'Completed maintenance', value: kpis.completedMaintenance },
    { label: 'Pending transfers', value: kpis.pendingTransfers },
    { label: 'Approved transfers', value: kpis.approvedTransfers },
    { label: 'Completed transfers', value: kpis.completedTransfers },
  ];
}

const KPI_COLUMNS = [
  { key: 'label', header: 'KPI', width: 24 },
  { key: 'value', header: 'Value', type: 'number', width: 16 },
];

const NAMED_COUNT_COLUMNS = [
  { key: 'name', header: 'Name', width: 24 },
  { key: 'code', header: 'Code', width: 14 },
  { key: 'value', header: 'Count', type: 'integer', width: 12 },
];

function summarySheets(summary) {
  return [
    { name: 'KPIs', columns: KPI_COLUMNS, rows: kpiItems(summary.kpis) },
    {
      name: 'Assets by Status',
      columns: NAMED_COUNT_COLUMNS,
      rows: summary.assetsByStatus.map((row) => ({ name: row.name, code: row.slug, value: row.value })),
    },
    {
      name: 'Assets by Category',
      columns: [
        { key: 'name', header: 'Category', width: 20 },
        { key: 'department', header: 'Department', width: 20 },
        { key: 'value', header: 'Count', type: 'integer', width: 12 },
      ],
      rows: summary.assetsByCategory,
    },
    { name: 'Assets by Municipality', columns: NAMED_COUNT_COLUMNS, rows: summary.assetsByMunicipality },
    { name: 'Transfers by Status', columns: NAMED_COUNT_COLUMNS, rows: summary.transfersByStatus.map((row) => ({ name: row.name, code: row.slug, value: row.value })) },
  ];
}

function summaryPdfSections(summary) {
  return [
    { heading: 'KPIs', kind: 'kpis', items: kpiItems(summary.kpis) },
    {
      heading: 'Assets by Status',
      columns: NAMED_COUNT_COLUMNS,
      rows: summary.assetsByStatus.map((row) => ({ name: row.name, code: row.slug, value: row.value })),
    },
    {
      heading: 'Assets by Category',
      columns: [
        { key: 'name', header: 'Category', width: 2 },
        { key: 'department', header: 'Department', width: 2 },
        { key: 'value', header: 'Count', width: 1 },
      ],
      rows: summary.assetsByCategory,
    },
    { heading: 'Assets by Municipality', columns: NAMED_COUNT_COLUMNS, rows: summary.assetsByMunicipality },
    {
      heading: 'Transfers by Status',
      columns: NAMED_COUNT_COLUMNS,
      rows: summary.transfersByStatus.map((row) => ({ name: row.name, code: row.slug, value: row.value })),
    },
  ];
}

const REPORT_FETCHERS = {
  inventory: getInventoryReport,
  municipality: getMunicipalityReport,
  school: getSchoolReport,
  maintenance: getMaintenanceReport,
  transfers: getTransferReport,
  summary: getSummaryReport,
};

const REPORT_TITLES = {
  inventory: 'Inventory Report',
  municipality: 'Municipality Report',
  school: 'School Report',
  maintenance: 'Maintenance Report',
  transfers: 'Transfers Report',
  summary: 'Executive Summary Report',
};

const REPORT_LAYOUT = {
  inventory: 'landscape',
  municipality: 'portrait',
  school: 'portrait',
  maintenance: 'landscape',
  transfers: 'landscape',
  summary: 'portrait',
};

async function buildExportDefinition(user, reportType, query) {
  const generatedAt = new Date().toISOString();
  const meta = {
    title: REPORT_TITLES[reportType],
    generatedAt,
    generatedBy: generatedBy(user),
    scopeLabel: scopeLabel(user),
  };

  if (reportType === 'summary') {
    const result = await getSummaryReport(user, query);
    return {
      ...meta,
      layout: REPORT_LAYOUT.summary,
      sheets: summarySheets(result.data),
      pdfSections: summaryPdfSections(result.data),
    };
  }

  const fetcher = REPORT_FETCHERS[reportType];
  const result = await fetcher(user, query, { paginate: false });

  if (reportType === 'inventory') {
    const rows = result.data.map(flattenInventory);
    return {
      ...meta,
      layout: 'landscape',
      sheets: [{ name: 'Inventory', columns: INVENTORY_EXCEL_COLUMNS, rows }],
      pdfSections: [{ columns: INVENTORY_COLUMNS, rows, fontSize: 7 }],
    };
  }

  if (reportType === 'municipality') {
    const rows = result.data.map(flattenMunicipality);
    return {
      ...meta,
      layout: 'portrait',
      sheets: [{ name: 'Municipalities', columns: MUNICIPALITY_COLUMNS, rows }],
      pdfSections: [{ columns: MUNICIPALITY_COLUMNS, rows, fontSize: 8 }],
    };
  }

  if (reportType === 'school') {
    const rows = result.data.map(flattenSchool);
    return {
      ...meta,
      layout: 'portrait',
      sheets: [{ name: 'Schools', columns: SCHOOL_COLUMNS, rows }],
      pdfSections: [{ columns: SCHOOL_COLUMNS, rows, fontSize: 7 }],
    };
  }

  if (reportType === 'maintenance') {
    const rows = result.data.map(flattenMaintenance);
    return {
      ...meta,
      layout: 'landscape',
      sheets: [{ name: 'Maintenance', columns: MAINTENANCE_COLUMNS, rows }],
      pdfSections: [{ columns: MAINTENANCE_COLUMNS, rows, fontSize: 7 }],
    };
  }

  const rows = result.data.map(flattenTransfer);
  return {
    ...meta,
    layout: 'landscape',
    sheets: [{ name: 'Transfers', columns: TRANSFER_COLUMNS, rows }],
    pdfSections: [{ columns: TRANSFER_COLUMNS, rows, fontSize: 7 }],
  };
}

async function exportReport(user, reportType, query) {
  if (!REPORT_FETCHERS[reportType]) {
    throw AppError.badRequest('reportType is invalid');
  }

  const format = query.format;
  if (format !== 'xlsx' && format !== 'pdf') {
    throw AppError.badRequest('format must be xlsx or pdf');
  }

  const definition = await buildExportDefinition(user, reportType, query);
  const filename = exportFilename(reportType, format);

  if (format === 'xlsx') {
    const buffer = await buildExcelBuffer(definition);
    return {
      buffer: Buffer.from(buffer),
      filename,
      contentType: XLSX_TYPE,
    };
  }

  const buffer = await buildPdfBuffer({
    ...definition,
    sections: definition.pdfSections,
  });

  return {
    buffer,
    filename,
    contentType: PDF_TYPE,
  };
}

module.exports = {
  EXPORT_ROW_CAP,
  getInventoryReport,
  getMunicipalityReport,
  getSchoolReport,
  getMaintenanceReport,
  getTransferReport,
  getSummaryReport,
  exportReport,
};

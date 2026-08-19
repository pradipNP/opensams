const maintenanceRepository = require('../repositories/maintenance.repository');
const assetRepository = require('../repositories/asset.repository');
const db = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const AppError = require('../utils/AppError');

const OPEN_STATUSES = ['pending', 'approved', 'in_progress'];

function toDto(row) {
  return {
    id: row.id,
    asset: {
      id: row.asset_id,
      assetTag: row.asset_tag,
      name: row.asset_name,
      status: row.asset_status_name,
    },
    school: {
      id: row.school_id,
      name: row.school_name,
      schoolCode: row.school_code,
    },
    requestedBy: {
      id: row.requested_by_id,
      fullName: row.requested_by_name,
    },
    approvedBy: row.approved_by_id
      ? { id: row.approved_by_id, fullName: row.approved_by_name }
      : null,
    assignedTo: row.assigned_to,
    status: row.status,
    priority: row.priority,
    description: row.description,
    estimatedCost: row.estimated_cost == null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost == null ? null : Number(row.actual_cost),
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    completedAt: row.completed_at,
    completionDate: row.completed_at,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePriority(value) {
  if (!value) {
    return 'medium';
  }
  const priority = String(value).trim().toLowerCase();
  if (priority === 'urgent') {
    return 'critical';
  }
  return priority;
}

function assertCanCreate(user, asset) {
  if (user.role === ROLES.STATE_ADMIN) {
    return;
  }
  if (user.role === ROLES.SCHOOL_ADMIN && asset.school_id === user.schoolId) {
    return;
  }
  throw AppError.forbidden();
}

async function setAssetStatus(client, { assetId, fromName, toSlug, userId, historyAction, notes }) {
  const nextStatus = await assetRepository.findStatusBySlug(toSlug);
  if (!nextStatus) {
    throw AppError.notFound(`Asset status "${toSlug}" is not configured`);
  }

  await assetRepository.update(client, assetId, { status_id: nextStatus.id });
  await assetRepository.insertHistory(client, {
    asset_id: assetId,
    action: historyAction,
    field_name: 'statusId',
    old_value: fromName,
    new_value: nextStatus.name,
    changed_by: userId,
    notes,
  });
}

async function listRequests(user, query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await maintenanceRepository.list(user, {
    status: query.status,
    priority: query.priority ? normalizePriority(query.priority) : undefined,
    schoolId: query.schoolId,
    assetId: query.assetId,
    search: query.search?.trim() || undefined,
    limit,
    offset,
  });

  return {
    data: rows.map(toDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getRequest(user, id) {
  const row = await maintenanceRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Maintenance request not found');
  }
  return toDto(row);
}

async function createRequest(user, body) {
  const asset = await assetRepository.findById(user, body.assetId);
  if (!asset) {
    throw AppError.notFound('Asset not found');
  }
  assertCanCreate(user, asset);

  const openCount = await maintenanceRepository.countOpenForAsset(asset.id);
  if (openCount > 0) {
    throw AppError.conflict('An open maintenance request already exists for this asset');
  }

  const created = await db.withTransaction(async (client) => {
    const inserted = await maintenanceRepository.insert(client, {
      asset_id: asset.id,
      school_id: asset.school_id,
      requested_by: user.id,
      priority: normalizePriority(body.priority),
      description: body.description.trim(),
      estimated_cost: body.estimatedCost ?? null,
      notes: body.notes || null,
    });

    await assetRepository.insertHistory(client, {
      asset_id: asset.id,
      action: 'maintenance_requested',
      new_value: inserted.id,
      changed_by: user.id,
      notes: body.description.trim(),
    });

    return inserted.id;
  });

  return getRequest(user, created);
}

async function approveRequest(user, id, body = {}) {
  const row = await maintenanceRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Maintenance request not found');
  }
  if (row.status !== 'pending') {
    throw AppError.badRequest('Only pending requests can be approved');
  }

  await db.withTransaction(async (client) => {
    await maintenanceRepository.update(client, id, {
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date(),
      started_at: new Date(),
      assigned_to: body.assignedTo || row.assigned_to,
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    if (row.asset_status_slug === 'active') {
      await setAssetStatus(client, {
        assetId: row.asset_id,
        fromName: row.asset_status_name,
        toSlug: 'under_maintenance',
        userId: user.id,
        historyAction: 'status_changed',
        notes: 'Moved to under maintenance after request approval',
      });
    }
  });

  return getRequest(user, id);
}

async function rejectRequest(user, id, body = {}) {
  const row = await maintenanceRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Maintenance request not found');
  }
  if (!['pending', 'approved', 'in_progress'].includes(row.status)) {
    throw AppError.badRequest('Only open requests can be rejected');
  }
  if (!body.rejectionReason || !String(body.rejectionReason).trim()) {
    throw AppError.badRequest('rejectionReason is required');
  }

  await db.withTransaction(async (client) => {
    await maintenanceRepository.update(client, id, {
      status: 'rejected',
      approved_by: user.id,
      rejection_reason: String(body.rejectionReason).trim(),
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    const remainingOpen = await maintenanceRepository.countOpenForAsset(row.asset_id, id);
    if (row.asset_status_slug === 'under_maintenance' && remainingOpen === 0) {
      await setAssetStatus(client, {
        assetId: row.asset_id,
        fromName: row.asset_status_name,
        toSlug: 'active',
        userId: user.id,
        historyAction: 'status_changed',
        notes: 'Returned to active after maintenance rejection',
      });
    }
  });

  return getRequest(user, id);
}

async function completeRequest(user, id, body = {}) {
  const row = await maintenanceRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Maintenance request not found');
  }
  if (!['approved', 'in_progress'].includes(row.status)) {
    throw AppError.badRequest('Only approved requests can be completed');
  }

  await db.withTransaction(async (client) => {
    await maintenanceRepository.update(client, id, {
      status: 'completed',
      completed_at: new Date(),
      actual_cost: body.actualCost !== undefined ? body.actualCost : row.actual_cost,
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    await assetRepository.insertHistory(client, {
      asset_id: row.asset_id,
      action: 'maintenance_completed',
      changed_by: user.id,
      notes: body.notes || 'Maintenance completed',
    });

    const remainingOpen = await maintenanceRepository.countOpenForAsset(row.asset_id, id);
    if (row.asset_status_slug === 'under_maintenance' && remainingOpen === 0) {
      await setAssetStatus(client, {
        assetId: row.asset_id,
        fromName: row.asset_status_name,
        toSlug: 'active',
        userId: user.id,
        historyAction: 'status_changed',
        notes: 'Returned to active after maintenance completion',
      });
    }
  });

  return getRequest(user, id);
}

module.exports = {
  listRequests,
  getRequest,
  createRequest,
  approveRequest,
  rejectRequest,
  completeRequest,
  OPEN_STATUSES,
};

const transferRepository = require('../repositories/transfer.repository');
const assetRepository = require('../repositories/asset.repository');
const db = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const AppError = require('../utils/AppError');

const ACTIVE_STATUSES = ['draft', 'pending', 'approved'];

function toSchoolDto(prefix, row) {
  return {
    id: row[`${prefix}_school_id`],
    name: row[`${prefix}_school_name`],
    schoolCode: row[`${prefix}_school_code`],
    municipality: {
      id: row[`${prefix}_municipality_id`],
      name: row[`${prefix}_municipality_name`],
      code: row[`${prefix}_municipality_code`],
    },
  };
}

function toDto(row) {
  return {
    id: row.id,
    asset: {
      id: row.asset_id,
      assetTag: row.asset_tag,
      name: row.asset_name,
      status: row.asset_status_name,
    },
    fromSchool: toSchoolDto('from', row),
    toSchool: toSchoolDto('to', row),
    requestedBy: {
      id: row.requested_by_id,
      fullName: row.requested_by_name,
    },
    approvedBy: row.approved_by_id
      ? { id: row.approved_by_id, fullName: row.approved_by_name }
      : null,
    status: row.status,
    reason: row.reason,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    transferDate: row.transfer_date,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

async function writeHistory(client, { assetId, action, userId, fieldName, oldValue, newValue, notes, metadata }) {
  await assetRepository.insertHistory(client, {
    asset_id: assetId,
    action,
    field_name: fieldName,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
    changed_by: userId,
    notes,
    metadata: metadata || {},
  });
}

async function listTransfers(user, query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await transferRepository.list(user, {
    status: query.status,
    assetId: query.assetId,
    schoolId: query.schoolId,
    municipalityId: query.municipalityId,
    search: query.search?.trim() || undefined,
    limit,
    offset,
  });

  return {
    data: rows.map(toDto),
    meta: buildMeta(page, limit, total),
  };
}

async function getTransfer(user, id) {
  const row = await transferRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Transfer not found');
  }
  return toDto(row);
}

async function createTransfer(user, body) {
  const asset = await assetRepository.findById(user, body.assetId);
  if (!asset) {
    throw AppError.notFound('Asset not found');
  }
  assertCanCreate(user, asset);

  if (asset.status_slug === 'under_maintenance') {
    throw AppError.conflict('Asset under maintenance cannot be transferred');
  }

  const toSchool = await transferRepository.findSchoolById(body.toSchoolId);
  if (!toSchool) {
    throw AppError.notFound('Destination school not found');
  }
  if (!toSchool.is_active) {
    throw AppError.badRequest('Destination school is inactive');
  }
  if (toSchool.id === asset.school_id) {
    throw AppError.badRequest('Transfer between the same school is not allowed');
  }

  const activeCount = await transferRepository.countActiveForAsset(asset.id);
  if (activeCount > 0) {
    throw AppError.conflict('An active transfer already exists for this asset');
  }

  const created = await db.withTransaction(async (client) => {
    const inserted = await transferRepository.insert(client, {
      asset_id: asset.id,
      from_school_id: asset.school_id,
      to_school_id: toSchool.id,
      requested_by: user.id,
      reason: body.reason.trim(),
      notes: body.notes || null,
    });

    await writeHistory(client, {
      assetId: asset.id,
      action: 'transfer_requested',
      userId: user.id,
      fieldName: 'schoolId',
      oldValue: asset.school_name,
      newValue: toSchool.name,
      notes: body.reason.trim(),
      metadata: {
        transferId: inserted.id,
        fromSchoolId: asset.school_id,
        toSchoolId: toSchool.id,
      },
    });

    return inserted.id;
  });

  return getTransfer(user, created);
}

async function approveTransfer(user, id, body = {}) {
  const row = await transferRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Transfer not found');
  }
  if (row.status !== 'pending') {
    throw AppError.badRequest('Only pending transfers can be approved');
  }

  await db.withTransaction(async (client) => {
    await transferRepository.update(client, id, {
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date(),
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    await writeHistory(client, {
      assetId: row.asset_id,
      action: 'transfer_approved',
      userId: user.id,
      newValue: id,
      notes: body.notes || 'Transfer approved',
      metadata: { transferId: id },
    });
  });

  return getTransfer(user, id);
}

async function rejectTransfer(user, id, body = {}) {
  const row = await transferRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Transfer not found');
  }
  if (row.status !== 'pending') {
    throw AppError.badRequest('Only pending transfers can be rejected');
  }
  if (!body.rejectionReason || !String(body.rejectionReason).trim()) {
    throw AppError.badRequest('rejectionReason is required');
  }

  const rejectionReason = String(body.rejectionReason).trim();

  await db.withTransaction(async (client) => {
    await transferRepository.update(client, id, {
      status: 'rejected',
      approved_by: user.id,
      rejection_reason: rejectionReason,
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    await writeHistory(client, {
      assetId: row.asset_id,
      action: 'transfer_rejected',
      userId: user.id,
      newValue: id,
      notes: rejectionReason,
      metadata: { transferId: id },
    });
  });

  return getTransfer(user, id);
}

async function completeTransfer(user, id, body = {}) {
  const row = await transferRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Transfer not found');
  }
  if (row.status !== 'approved') {
    throw AppError.badRequest('Only approved transfers can be completed');
  }
  if (row.asset_deleted_at) {
    throw AppError.conflict('Deleted assets cannot be transferred');
  }
  if (row.asset_status_slug === 'under_maintenance') {
    throw AppError.conflict('Asset under maintenance cannot be transferred');
  }
  if (row.asset_current_school_id !== row.from_school_id) {
    throw AppError.conflict('Asset is no longer at the source school');
  }

  const completedAt = new Date();

  await db.withTransaction(async (client) => {
    await assetRepository.update(client, row.asset_id, {
      school_id: row.to_school_id,
    });

    await transferRepository.update(client, id, {
      status: 'completed',
      completed_at: completedAt,
      transfer_date: row.transfer_date || completedAt,
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    await writeHistory(client, {
      assetId: row.asset_id,
      action: 'transfer_completed',
      userId: user.id,
      fieldName: 'schoolId',
      oldValue: row.from_school_name,
      newValue: row.to_school_name,
      notes: body.notes || 'Transfer completed',
      metadata: {
        transferId: id,
        fromSchoolId: row.from_school_id,
        toSchoolId: row.to_school_id,
        fromMunicipalityId: row.from_municipality_id,
        toMunicipalityId: row.to_municipality_id,
      },
    });
  });

  return getTransfer(user, id);
}

async function cancelTransfer(user, id, body = {}) {
  const row = await transferRepository.findById(user, id);
  if (!row) {
    throw AppError.notFound('Transfer not found');
  }
  if (!['draft', 'pending'].includes(row.status)) {
    throw AppError.badRequest('Only draft or pending transfers can be cancelled');
  }

  await db.withTransaction(async (client) => {
    await transferRepository.update(client, id, {
      status: 'cancelled',
      notes: body.notes !== undefined ? body.notes : row.notes,
    });

    await writeHistory(client, {
      assetId: row.asset_id,
      action: 'transfer_cancelled',
      userId: user.id,
      newValue: id,
      notes: body.notes || 'Transfer cancelled',
      metadata: { transferId: id },
    });
  });

  return getTransfer(user, id);
}

module.exports = {
  listTransfers,
  getTransfer,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  cancelTransfer,
  ACTIVE_STATUSES,
};

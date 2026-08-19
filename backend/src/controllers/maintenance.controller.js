const maintenanceService = require('../services/maintenance.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await maintenanceService.listRequests(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await maintenanceService.getRequest(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await maintenanceService.createRequest(req.user, req.body);
  res.status(201).json({ success: true, data });
});

const approve = asyncHandler(async (req, res) => {
  const data = await maintenanceService.approveRequest(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const reject = asyncHandler(async (req, res) => {
  const data = await maintenanceService.rejectRequest(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const complete = asyncHandler(async (req, res) => {
  const data = await maintenanceService.completeRequest(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  create,
  approve,
  reject,
  complete,
};

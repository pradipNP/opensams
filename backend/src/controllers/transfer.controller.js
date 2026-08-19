const transferService = require('../services/transfer.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await transferService.listTransfers(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await transferService.getTransfer(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await transferService.createTransfer(req.user, req.body);
  res.status(201).json({ success: true, data });
});

const approve = asyncHandler(async (req, res) => {
  const data = await transferService.approveTransfer(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const reject = asyncHandler(async (req, res) => {
  const data = await transferService.rejectTransfer(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const complete = asyncHandler(async (req, res) => {
  const data = await transferService.completeTransfer(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const cancel = asyncHandler(async (req, res) => {
  const data = await transferService.cancelTransfer(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  create,
  approve,
  reject,
  complete,
  cancel,
};

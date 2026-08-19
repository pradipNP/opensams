const assetService = require('../services/asset.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await assetService.listAssets(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await assetService.getAsset(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const verify = asyncHandler(async (req, res) => {
  const data = await assetService.verifyAsset(req.params.tag);
  res.status(200).json({ success: true, data });
});

const qr = asyncHandler(async (req, res) => {
  const data = await assetService.getAssetQr(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const history = asyncHandler(async (req, res) => {
  const result = await assetService.listHistory(req.user, req.params.id, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const create = asyncHandler(async (req, res) => {
  const data = await assetService.createAsset(req.user, req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await assetService.updateAsset(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await assetService.deleteAsset(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  verify,
  qr,
  history,
  create,
  update,
  remove,
};

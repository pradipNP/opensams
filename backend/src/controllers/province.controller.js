const provinceService = require('../services/province.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await provinceService.listProvinces();
  res.status(200).json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await provinceService.getProvince(req.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
};

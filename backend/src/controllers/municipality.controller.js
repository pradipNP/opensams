const municipalityService = require('../services/municipality.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await municipalityService.listMunicipalities(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await municipalityService.getMunicipality(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await municipalityService.createMunicipality(req.user, req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await municipalityService.updateMunicipality(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  create,
  update,
};

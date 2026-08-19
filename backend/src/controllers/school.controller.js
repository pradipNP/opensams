const schoolService = require('../services/school.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await schoolService.listSchools(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await schoolService.getSchool(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

const listAssets = asyncHandler(async (req, res) => {
  const result = await schoolService.listSchoolAssets(req.user, req.params.id, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const create = asyncHandler(async (req, res) => {
  const data = await schoolService.createSchool(req.user, req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await schoolService.updateSchool(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  listAssets,
  create,
  update,
};

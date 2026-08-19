const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories(req.query);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  create,
  update,
};

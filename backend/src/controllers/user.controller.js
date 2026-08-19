const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await userService.getUser(req.params.id);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await userService.deactivateUser(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};

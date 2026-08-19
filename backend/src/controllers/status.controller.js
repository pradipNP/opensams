const statusService = require('../services/status.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await statusService.listStatuses();
  res.status(200).json({ success: true, data });
});

module.exports = {
  list,
};

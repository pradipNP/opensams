const healthService = require('../services/health.service');
const asyncHandler = require('../utils/asyncHandler');

const health = asyncHandler(async (req, res) => {
  const data = await healthService.getHealth();
  res.status(200).json({ success: true, data });
});

module.exports = {
  health,
};

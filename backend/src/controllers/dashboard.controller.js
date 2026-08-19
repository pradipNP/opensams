const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview(req.user);
  res.status(200).json({ success: true, data });
});

const kpis = asyncHandler(async (req, res) => {
  const data = await dashboardService.getKpis(req.user);
  res.status(200).json({ success: true, data });
});

const municipality = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMunicipalityChart(req.user);
  res.status(200).json({ success: true, data });
});

const school = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSchoolChart(req.user);
  res.status(200).json({ success: true, data });
});

const category = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryChart(req.user);
  res.status(200).json({ success: true, data });
});

const status = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStatusChart(req.user);
  res.status(200).json({ success: true, data });
});

const valueByMunicipality = asyncHandler(async (req, res) => {
  const data = await dashboardService.getValueByMunicipalityChart(req.user);
  res.status(200).json({ success: true, data });
});

const transfers = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTransferChart(req.user);
  res.status(200).json({ success: true, data });
});

module.exports = {
  overview,
  kpis,
  municipality,
  school,
  category,
  status,
  valueByMunicipality,
  transfers,
};

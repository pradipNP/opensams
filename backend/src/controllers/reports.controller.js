const reportsService = require('../services/reports.service');
const asyncHandler = require('../utils/asyncHandler');

const inventory = asyncHandler(async (req, res) => {
  const result = await reportsService.getInventoryReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const municipality = asyncHandler(async (req, res) => {
  const result = await reportsService.getMunicipalityReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const school = asyncHandler(async (req, res) => {
  const result = await reportsService.getSchoolReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const maintenance = asyncHandler(async (req, res) => {
  const result = await reportsService.getMaintenanceReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const transfers = asyncHandler(async (req, res) => {
  const result = await reportsService.getTransferReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

const summary = asyncHandler(async (req, res) => {
  const result = await reportsService.getSummaryReport(req.user, req.query);
  res.status(200).json({ success: true, data: result.data });
});

const exportReport = asyncHandler(async (req, res) => {
  const result = await reportsService.exportReport(req.user, req.params.reportType, req.query);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.status(200).send(result.buffer);
});

module.exports = {
  inventory,
  municipality,
  school,
  maintenance,
  transfers,
  summary,
  exportReport,
};

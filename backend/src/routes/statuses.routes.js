const express = require('express');
const statusController = require('../controllers/status.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', statusController.list);

module.exports = router;

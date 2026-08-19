const express = require('express');
const provinceController = require('../controllers/province.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const { provinceIdParam } = require('../validators/province.validators');

const router = express.Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.MUNICIPALITIES_READ));

router.get('/', provinceController.list);
router.get('/:id', provinceIdParam, validate, provinceController.getById);

module.exports = router;

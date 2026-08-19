const express = require('express');
const municipalityController = require('../controllers/municipality.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, requireRoles } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS, ROLES } = require('../constants/roles');
const {
  listMunicipalities,
  municipalityIdParam,
  createMunicipality,
  updateMunicipality,
} = require('../validators/municipality.validators');

const router = express.Router();

router.use(authenticate);
router.use(requireRoles(ROLES.STATE_ADMIN, ROLES.MUNICIPAL_OFFICER));

router.get('/', listMunicipalities, validate, municipalityController.list);
router.post(
  '/',
  authorize(PERMISSIONS.MUNICIPALITIES_WRITE),
  createMunicipality,
  validate,
  municipalityController.create
);
router.get('/:id', municipalityIdParam, validate, municipalityController.getById);
router.put(
  '/:id',
  authorize(PERMISSIONS.MUNICIPALITIES_WRITE),
  updateMunicipality,
  validate,
  municipalityController.update
);

module.exports = router;

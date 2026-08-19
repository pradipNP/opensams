const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../constants/roles');
const {
  listUsers,
  userIdParam,
  createUser,
  updateUser,
} = require('../validators/user.validators');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.USERS_READ), listUsers, validate, userController.list);
router.post('/', authorize(PERMISSIONS.USERS_WRITE), createUser, validate, userController.create);
router.get('/:id', authorize(PERMISSIONS.USERS_READ), userIdParam, validate, userController.getById);
router.put('/:id', authorize(PERMISSIONS.USERS_WRITE), updateUser, validate, userController.update);
router.delete('/:id', authorize(PERMISSIONS.USERS_WRITE), userIdParam, validate, userController.remove);

module.exports = router;

const { body } = require('express-validator');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const loginValidators = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.status(200).json({ success: true, data });
});

const logout = asyncHandler(async (req, res) => {
  const data = authService.logout(req.user);
  res.status(200).json({ success: true, data });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.getCurrentUser(req.user.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  loginValidators,
  login,
  logout,
  me,
};

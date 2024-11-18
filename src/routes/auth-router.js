const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controllers');
const { authenticateToken } = require('../middleware/auth-middleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.patch('/change-password', authenticateToken, authController.changePassword);

module.exports = router; 
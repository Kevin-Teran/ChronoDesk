const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/auth.middleware'); // Importar el middleware

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/validate-secret-key', authController.validateSecretKey);
router.post('/check-password-strength', authController.checkPasswordStrength);

// Rutas protegidas
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const verifyToken = require('../middlewares/auth.Middleware');

router.get('/profile', verifyToken, sessionController.getProfile);

router.post('/logout', verifyToken, sessionController.logout);

module.exports = router;

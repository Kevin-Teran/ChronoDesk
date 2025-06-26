const express = require('express');
const router = express.Router();
const { getAllLogs, getLogsByUser, setLogout } = require('../controllers/loginLog.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getAllLogs);
router.get('/:userId', authMiddleware, getLogsByUser);
router.post('/logout/:userId', authMiddleware, setLogout);

module.exports = router;
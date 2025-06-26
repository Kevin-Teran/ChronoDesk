const express = require('express');
const router = express.Router();
const { getTasksByUser, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/:userId', authMiddleware, getTasksByUser);
router.post('/', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;

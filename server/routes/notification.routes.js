const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notification.controller');

// Obtener todas las notificaciones del usuario
router.get('/', authMiddleware, getUserNotifications);

// Marcar como leída una notificación
router.put('/:id/read', authMiddleware, markAsRead);

// Eliminar una notificación
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router;

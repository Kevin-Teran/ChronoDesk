const db = require('../models');
const Notification = db.Notification;

/**
 * Obtiene todas las notificaciones de un usuario ordenadas por fecha de creación (más recientes primero).
 * @param {Object} req - Objeto de solicitud Express con usuario autenticado.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con el array de notificaciones del usuario.
 * @throws {Error} Si ocurre un error al acceder a la base de datos.
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']] // Orden descendente por fecha de creación
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ 
      error: 'Error al obtener notificaciones',
      details: err.message 
    });
  }
};

/**
 * Marca una notificación específica como leída.
 * @param {Object} req - Objeto de solicitud Express con parámetro id y usuario autenticado.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON confirmando la operación o mensaje de error.
 * @throws {Error} Si ocurre un error al actualizar la notificación.
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID es un número válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de notificación inválido' });
    }

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id // Asegurar que la notificación pertenece al usuario
      }
    });

    if (!notification) {
      return res.status(404).json({ 
        error: 'Notificación no encontrada o no pertenece al usuario' 
      });
    }

    // Actualizar y guardar
    notification.isRead = true;
    notification.readAt = new Date(); // Registrar momento de lectura
    await notification.save();

    res.status(200).json({ 
      message: 'Notificación marcada como leída',
      notificationId: notification.id,
      readAt: notification.readAt
    });
  } catch (err) {
    console.error('Error al marcar notificación como leída:', err);
    res.status(500).json({ 
      error: 'Error al actualizar notificación',
      details: err.message 
    });
  }
};

/**
 * Elimina una notificación específica del usuario.
 * @param {Object} req - Objeto de solicitud Express con parámetro id y usuario autenticado.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON confirmando la eliminación o mensaje de error.
 * @throws {Error} Si ocurre un error al eliminar la notificación.
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID es un número válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de notificación inválido' });
    }

    const deleted = await Notification.destroy({
      where: {
        id,
        userId: req.user.id // Asegurar que solo se eliminen notificaciones propias
      }
    });

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Notificación no encontrada o no pertenece al usuario' 
      });
    }

    res.status(200).json({ 
      message: 'Notificación eliminada correctamente',
      notificationId: id
    });
  } catch (err) {
    console.error('Error al eliminar notificación:', err);
    res.status(500).json({ 
      error: 'Error al eliminar notificación',
      details: err.message 
    });
  }
};
const LoginLog = require('../models/LoginLog');

/**
 * Obtiene todos los registros de inicio de sesión del sistema.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con todos los registros de login.
 * @throws {Error} Si ocurre un error al acceder a la base de datos.
 */
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await LoginLog.findAll();
    res.json(logs);
  } catch (error) {
    console.error('Error obteniendo logs de login:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener logs.' });
  }
};

/**
 * Obtiene los registros de inicio de sesión para un usuario específico.
 * @param {Object} req - Objeto de solicitud Express con parámetro userId.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con los logs de login del usuario.
 * @throws {Error} Si ocurre un error al acceder a la base de datos.
 */
exports.getLogsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    const logs = await LoginLog.findAll({ 
      where: { userId: userId },
      order: [['loginAt', 'DESC']] // Ordenar por fecha descendente
    });
    
    res.json(logs);
  } catch (error) {
    console.error(`Error obteniendo logs para usuario ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor al obtener logs de usuario.' });
  }
};

/**
 * Marca como cerrada la sesión activa más reciente de un usuario.
 * @param {Object} req - Objeto de solicitud Express con parámetro userId.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON confirmando el cierre de sesión.
 * @throws {Error} Si ocurre un error al actualizar el registro.
 */
exports.setLogout = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    const log = await LoginLog.findOne({
      where: {
        userId: userId,
        active: true,
      },
      order: [['loginAt', 'DESC']], // Obtener la sesión más reciente
    });

    if (log) {
      await log.update({ 
        active: false,
        logoutAt: new Date() // Registrar momento del logout
      });
      res.json({ 
        message: 'Sesión cerrada correctamente.',
        logoutTime: new Date()
      });
    } else {
      res.status(404).json({ error: 'No hay sesión activa registrada para este usuario.' });
    }
  } catch (error) {
    console.error(`Error cerrando sesión para usuario ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor al cerrar sesión.' });
  }
};
const User = require('../models/User');

/**
 * Obtener perfil del usuario autenticado
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
  }
};

/**
 * Logout (opcionalmente puedes invalidar tokens si guardas una lista de revocados)
 */
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error al cerrar sesión' });
  }
};

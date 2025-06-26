const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Genera un token JWT con datos esenciales del usuario.
 * @param {Object} user - Objeto usuario que debe contener al menos id, role y username.
 * @param {string} expiresIn - Duración del token, ejemplo: '1h', '7d'.
 * @returns {string} Token JWT firmado.
 */
const generateToken = (user, expiresIn = '1h') => {
  if (!user || !user.id) {
    throw new Error('Usuario inválido para generar token');
  }

  const payload = {
    id: user.id,
    role: user.role || 'user',
    username: user.username || '',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
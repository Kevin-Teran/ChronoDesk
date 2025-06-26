import { jwtDecode } from 'jwt-decode';

/**
 * Obtener el token desde localStorage
 * @returns {string|null}
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Eliminar el token del almacenamiento
 */
export const removeToken = () => localStorage.removeItem('token');

/**
 * Decodificar y validar token JWT
 * @returns {Object|null} Payload del token si es válido, o null si no
 */
export const decodeToken = () => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp <= now) {
      removeToken();
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decodificando token:', error);
    removeToken();
    return null;
  }
};

/**
 * Verificar si el usuario está autenticado (token válido)
 * @returns {boolean}
 */
export const isTokenValid = () => {
  return !!decodeToken();
};

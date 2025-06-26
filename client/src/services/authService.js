import api from './api';

/**
 * Validar clave secreta
 * @param {string} secretKey - Clave secreta a validar
 * @returns {Promise} Respuesta con roles disponibles
 */
export const validateSecretKey = async (secretKey) => {
  try {
    if (!secretKey || !secretKey.trim()) {
      throw new Error('La clave secreta es requerida');
    }

    const response = await api.post('/auth/validate-secret-key', { 
      secretKey: secretKey.trim() 
    });
    
    return response.data;
  } catch (error) {
    console.error('Error validando clave secreta:', error.response?.data || error.message);
    
    // Lanzar error estructurado
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Error al validar la clave secreta';
    
    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
};

/**
 * Iniciar sesión
 * @param {Object} credentials - Credenciales de login
 * @param {string} credentials.identifier - Usuario o email
 * @param {string} credentials.password - Contraseña
 * @param {boolean} credentials.rememberMe - Recordar sesión
 * @returns {Promise} Respuesta con token y datos del usuario
 */
export const loginUser = async ({ identifier, password, rememberMe = false }) => {
  try {
    if (!identifier || !identifier.trim()) {
      throw new Error('Usuario o email es requerido');
    }
    
    if (!password) {
      throw new Error('La contraseña es requerida');
    }

    const response = await api.post('/auth/login', {
      identifier: identifier.trim(),
      password,
      rememberMe,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Error al iniciar sesión';
    
    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.firstName - Nombre
 * @param {string} userData.lastName - Apellido
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Teléfono
 * @param {string} userData.password - Contraseña
 * @param {string} [userData.secretKey] - Clave secreta opcional
 * @param {string} [userData.role] - Rol del usuario
 * @returns {Promise} Respuesta con datos del usuario creado
 */
export const registerUser = async (userData) => {
  try {
    // Validaciones básicas
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field] || !userData[field].toString().trim());
    
    if (missingFields.length > 0) {
      throw new Error(`Los siguientes campos son requeridos: ${missingFields.join(', ')}`);
    }

    // Preparar payload
    const payload = {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      username: userData.username.trim(),
      email: userData.email.trim(),
      phone: userData.phone.trim(),
      password: userData.password,
    };

    // Agregar campos opcionales si están presentes
    if (userData.secretKey && userData.secretKey.trim()) {
      payload.secretKey = userData.secretKey.trim();
      
      if (userData.role) {
        payload.role = userData.role;
      }
    }

    const response = await api.post('/auth/register', payload);
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error.response?.data || error.message);
    
    let errorMessage;
    
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.join(', ');
    } else {
      errorMessage = error.response?.data?.error || 
                    error.response?.data?.message || 
                    error.message || 
                    'Error al registrar usuario';
    }
    
    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
};

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise} Datos del usuario o null si no está autenticado
 */
export const getUserFromToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Error obteniendo perfil:', error.response?.data || error.message);
    
    // Si el token es inválido, limpiarlo
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
    }
    
    return null;
  }
};

/**
 * Cerrar sesión
 * @returns {Promise} Resultado del logout
 */
export const logoutUser = async () => {
  try {
    // Intentar hacer logout en el servidor
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error en logout del servidor:', error);
    // Continuar con el logout local aunque falle el servidor
  } finally {
    // Siempre limpiar el token local
    localStorage.removeItem('token');
  }
};

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean} True si hay un token válido
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Verificar si el token no ha expirado (básico)
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    return tokenData.exp > now;
  } catch (error) {
    console.error('Error verificando token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Obtener datos del token sin hacer petición al servidor
 * @returns {Object|null} Datos del token decodificado
 */
export const getTokenData = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (tokenData.exp <= now) {
      localStorage.removeItem('token');
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error('Error decodificando token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

/**
 * Refrescar perfil del usuario
 * @returns {Promise} Datos actualizados del usuario
 */
export const refreshUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Error refrescando perfil:', error);
    throw error;
  }
};
/**
 * Limpia los datos de autenticación del localStorage
 */
 export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
/**
 * Obtener el token del localStorage
 * @returns {string|null} Token de autenticación
 */
 export const getAuthToken = () => {
  return localStorage.getItem('token');
};
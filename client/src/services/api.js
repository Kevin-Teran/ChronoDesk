/**
 * @file api.js
 * @description Configuración global de Axios con interceptores para autenticación y manejo de errores,
 * así como helpers de utilidad para peticiones HTTP reutilizables.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

// ⚙️ Crea una instancia de Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// 🔐 Interceptor para agregar token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      console.log('🚨 Token inválido o expirado - Limpiando almacenamiento local');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.log('🔄 Redirigiendo a login desde:', currentPath);
        window.location.href = `/login?expired=true&from=${encodeURIComponent(currentPath)}`;
      }

    } else if (error.response?.status === 403) {
      console.log('🚫 Acceso denegado - Posible problema con plan o permisos');

    } else if (error.response?.status >= 500) {
      console.log('🔥 Error del servidor');

    } else if (error.code === 'ECONNABORTED') {
      console.log('⏰ Timeout de conexión');
      error.message = 'La conexión tardó demasiado. Verifica tu conexión a internet.';

    } else if (error.code === 'ERR_NETWORK') {
      console.log('🌐 Error de red');
      error.message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    }

    return Promise.reject(error);
  }
);

/**
 * @namespace apiHelper
 * @description Conjunto de métodos HTTP con logging adicional.
 */
export const apiHelper = {
  /**
   * Ejecuta una petición GET.
   * @param {string} url - Ruta de la API.
   * @param {Object} [config] - Configuración adicional de Axios.
   * @returns {Promise} Promesa con la respuesta.
   */
  get: (url, config = {}) => {
    return api.get(url, config);
  },

  /**
   * Ejecuta una petición POST.
   * @param {string} url - Ruta de la API.
   * @param {Object} data - Datos a enviar.
   * @param {Object} [config] - Configuración adicional de Axios.
   * @returns {Promise} Promesa con la respuesta.
   */
  post: (url, data, config = {}) => {
    return api.post(url, data, config);
  },

  /**
   * Ejecuta una petición PUT.
   * @param {string} url - Ruta de la API.
   * @param {Object} data - Datos a enviar.
   * @param {Object} [config] - Configuración adicional de Axios.
   * @returns {Promise} Promesa con la respuesta.
   */
  put: (url, data, config = {}) => {
    return api.put(url, data, config);
  },

  /**
   * Ejecuta una petición PATCH.
   * @param {string} url - Ruta de la API.
   * @param {Object} data - Datos a enviar.
   * @param {Object} [config] - Configuración adicional de Axios.
   * @returns {Promise} Promesa con la respuesta.
   */
  patch: (url, data, config = {}) => {
    return api.patch(url, data, config);
  },

  /**
   * Ejecuta una petición DELETE.
   * @param {string} url - Ruta de la API.
   * @param {Object} [config] - Configuración adicional de Axios.
   * @returns {Promise} Promesa con la respuesta.
   */
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
};

/**
 * Verifica el estado del servidor.
 * @returns {Promise<{healthy: boolean, data?: any, error?: string}>}
 */
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return { healthy: true, data: response.data };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

/**
 * Ejecuta una función que hace una petición con reintentos.
 * @param {Function} requestFn - Función que retorna una promesa (request HTTP).
 * @param {number} [maxRetries=3] - Número máximo de intentos.
 * @param {number} [delay=1000] - Tiempo inicial de espera entre reintentos en ms.
 * @returns {Promise<any>} Resultado de la petición exitosa o error final.
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      console.log(`🔄 Reintentando request (${i + 1}/${maxRetries}) en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

export default api;

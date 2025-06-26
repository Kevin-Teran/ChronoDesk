/**
 * @file api.js
 * @description Configuración global de Axios con interceptores para autenticación, manejo de errores,
 * caché inteligente, reintentos automáticos y métricas de rendimiento.
 */

 import axios from 'axios';
 import { getItem, removeItem } from './storage'; // Asume un helper de localStorage seguro
 
 // Configuración desde variables de entorno
 const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
 const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
 const MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES || '3');
 const RETRY_DELAY_BASE = parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000');
 
 // 📊 Métricas de rendimiento
 const performanceMetrics = {
   totalRequests: 0,
   failedRequests: 0,
   successRate: 100,
   averageResponseTime: 0
 };
 
 // 🗃️ Caché simple para GET requests
 const responseCache = new Map();
 
 // ⚙️ Crea instancia de Axios con configuración base
 const api = axios.create({
   baseURL: API_BASE_URL,
   timeout: API_TIMEOUT,
   headers: {
     'Content-Type': 'application/json',
     'X-Application': 'ChronoDesk/1.0.0' // Identificador de cliente
   }
 });
 
 // 🔐 Interceptor de Request para autenticación
 api.interceptors.request.use(
   async (config) => {
     performanceMetrics.totalRequests++;
     const startTime = Date.now();
     config.metadata = { startTime };
 
     // 🗝️ Manejo de token seguro
     const token = getItem('authToken'); // Usa helper seguro
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
 
     // 🗄️ Cachear GET requests cuando se solicite
     if (config.method?.toLowerCase() === 'get' && config.cache) {
       const cacheKey = JSON.stringify(config);
       if (responseCache.has(cacheKey)) {
         const cached = responseCache.get(cacheKey);
         if (cached.expiry > Date.now()) {
           console.debug('⚡ Sirviendo desde caché');
           return { ...cached.response, config };
         }
         responseCache.delete(cacheKey);
       }
     }
 
     return config;
   },
   (error) => {
     trackError('REQUEST', error);
     return Promise.reject(error);
   }
 );
 
 // 📡 Interceptor de Response con manejo avanzado de errores
 api.interceptors.response.use(
   (response) => {
     const endTime = Date.now();
     const duration = endTime - response.config.metadata.startTime;
     updateMetrics(true, duration);
 
     // 🗄️ Guardar en caché si está configurado
     if (response.config.method?.toLowerCase() === 'get' && response.config.cache) {
       const cacheKey = JSON.stringify(response.config);
       responseCache.set(cacheKey, {
         response,
         expiry: Date.now() + (response.config.cacheTTL || 60000) // 1 minuto por defecto
       });
     }
 
     return response.data; // ⚡ Retorna solo los datos por defecto
   },
   async (error) => {
     const endTime = Date.now();
     const duration = endTime - (error.config?.metadata?.startTime || endTime);
     updateMetrics(false, duration);
 
     const errorData = error.response?.data || {};
     const status = error.response?.status;
     const originalRequest = error.config;
 
     // 🔄 Manejo de errores específicos
     switch (status) {
       case 401: // No autorizado
         handleUnauthorized(error);
         break;
         
       case 403: // Prohibido
         console.warn('🚫 Acceso denegado:', errorData.message || 'Sin mensaje de error');
         if (typeof window !== 'undefined') {
           window.dispatchEvent(new CustomEvent('api-forbidden', { detail: errorData }));
         }
         break;
         
       case 429: // Too Many Requests
         const retryAfter = error.response?.headers?.['retry-after'] || 5;
         console.warn(`🛑 Rate limit alcanzado. Reintentando en ${retryAfter} segundos...`);
         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
         return api(originalRequest);
         
       case 500: // Error interno
         trackError('SERVER', error);
         break;
         
       default:
         trackError('NETWORK', error);
     }
 
     // Propagamos el error enriquecido
     return Promise.reject({
       ...errorData,
       status,
       isApiError: true,
       originalError: error
     });
   }
 );
 
 // 🛠️ Helpers de utilidad
 const trackError = (type, error) => {
   console.error(`❌ [${type}] Error en API:`, {
     message: error.message,
     code: error.code,
     url: error.config?.url,
     status: error.response?.status
   });
 };
 
 const updateMetrics = (success, duration) => {
   if (!success) performanceMetrics.failedRequests++;
   performanceMetrics.successRate = 
     ((performanceMetrics.totalRequests - performanceMetrics.failedRequests) / 
      performanceMetrics.totalRequests) * 100;
   performanceMetrics.averageResponseTime = 
     (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + duration) / 
     performanceMetrics.totalRequests;
 };
 
 const handleUnauthorized = (error) => {
   console.warn('🔐 Sesión expirada o inválida');
   removeItem('authToken');
   removeItem('userData');
   
   if (typeof window !== 'undefined' && !window.location.pathname.includes('auth')) {
     // Usa el router de tu framework en lugar de window.location si es posible
     window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
   }
 };
 
 // 🧩 API Helper con métodos mejorados
 export const apiHelper = {
   get: (url, config = {}) => api.get(url, { ...config, cache: true }),
   post: (url, data, config = {}) => api.post(url, data, config),
   put: (url, data, config = {}) => api.put(url, data, config),
   patch: (url, data, config = {}) => api.patch(url, data, config),
   delete: (url, config = {}) => api.delete(url, config),
   
   /**
    * Método seguro con reintentos automáticos
    */
   secureFetch: async (url, options = {}, retries = MAX_RETRIES) => {
     try {
       return await api(url, options);
     } catch (error) {
       if (retries > 0 && error.status !== 401 && error.status !== 403) {
         const delay = RETRY_DELAY_BASE * (MAX_RETRIES - retries + 1);
         console.warn(`🔄 Reintentando (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) en ${delay}ms...`);
         await new Promise(resolve => setTimeout(resolve, delay));
         return apiHelper.secureFetch(url, options, retries - 1);
       }
       throw error;
     }
   },
   
   getMetrics: () => ({ ...performanceMetrics }),
   clearCache: () => responseCache.clear()
 };
 
 // 🩺 Health Check mejorado
 export const checkServerHealth = async () => {
   try {
     const { data } = await api.get('/health', { timeout: 3000 });
     return { 
       healthy: true,
       status: data.status,
       services: data.services 
     };
   } catch (error) {
     return {
       healthy: false,
       status: 'down',
       error: error.message,
       lastMetrics: apiHelper.getMetrics()
     };
   }
 };
 
 export default api;
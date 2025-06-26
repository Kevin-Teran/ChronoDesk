import axios from 'axios';

// Configuración base de axios con valores por defecto
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Error con respuesta del servidor (4xx, 5xx)
      console.error('Error en la respuesta:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    } else if (error.request) {
      // Error sin respuesta (falla de red, servidor no responde)
      console.error('Error en la solicitud:', error.request);
    } else {
      // Error en la configuración de la solicitud
      console.error('Error:', error.message);
    }
    
    // Devuelve un error consistente
    return Promise.reject({
      message: error.response?.data?.message || 'Error en la solicitud',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

/**
 * Obtiene todas las reseñas desde la API
 * @async
 * @function getAllReviews
 * @param {Object} [params] - Parámetros opcionales para filtrado/paginación
 * @returns {Promise<Array>} Lista de reseñas formateadas
 */
export const getAllReviews = async (params = {}) => {
  try {
    const response = await apiClient.get('/reviews', { params });
    
    return response.data.map(review => ({
      id: review.id,
      content: review.comment,
      rating: review.rating,
      user: {
        id: review.user?.id,
        name: review.user?.name || `${review.user?.firstName} ${review.user?.lastName}` || "Anónimo",
        initials: review.user?.firstName?.charAt(0) + review.user?.lastName?.charAt(0) || "NN",
        username: review.user?.username,
        avatar: review.user?.avatar || ""
      },
      date: review.createdAt,
      productId: review.productId,
      helpfulVotes: review.helpfulVotes || 0
    }));
  } catch (error) {
    console.error("Error en getAllReviews:", error);
    throw error; // Re-lanzamos el error para manejo en el componente
  }
};

/**
 * Crea una nueva reseña
 * @async
 * @function createReview
 * @param {Object} reviewData - Datos de la reseña a crear
 * @param {number} reviewData.rating - Valoración (1-5)
 * @param {string} reviewData.comment - Texto de la reseña
 * @param {number} reviewData.productId - ID del producto relacionado
 * @returns {Promise<Object>} Reseña creada
 */
export const createReview = async ({ rating, comment, productId }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await apiClient.post('/reviews', {
      rating,
      comment,
      productId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      ...response.data,
      user: {
        name: response.data.user?.name || `${response.data.user?.firstName} ${response.data.user?.lastName}`,
        initials: response.data.user?.firstName?.charAt(0) + response.data.user?.lastName?.charAt(0),
        username: response.data.user?.username
      }
    };
  } catch (error) {
    console.error("Error en createReview:", error);
    throw error;
  }
};

/**
 * Marca una reseña como útil
 * @async
 * @function markHelpful
 * @param {number} reviewId - ID de la reseña
 * @returns {Promise<Object>} Reseña actualizada
 */
export const markHelpful = async (reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    console.error("Error en markHelpful:", error);
    throw error;
  }
};
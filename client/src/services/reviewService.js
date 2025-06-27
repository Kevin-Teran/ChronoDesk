/**
 * @file reviewService.js
 * @description Servicio para manejo de reseñas con lógica de negocio específica
 * Utiliza api.js para las llamadas HTTP básicas
 */

import { apiHelper } from './api.js';

/**
 * Servicio de reseñas con lógica de negocio específica
 */
export const reviewService = {
  /**
   * Obtiene todas las reseñas (simplificado para Landing)
   * @param {number} limit - Límite de reseñas a obtener
   * @returns {Promise<Array>} Array de reseñas formateadas
   */
  async getAllReviews(limit = 3) {
    try {
      const response = await apiHelper.get('/reviews', {
        params: { limit }
      });
      return this.formatReviewsData(response.data.reviews || response.data || []);
    } catch (error) {
      console.error('Error getting all reviews:', error);
      // Datos mock para desarrollo
      return this.formatReviewsData([
        {
          id: 1,
          rating: 5,
          comment: "Excelente aplicación, ha mejorado nuestra productividad",
          user: { name: "Carlos Martínez", avatar: "" },
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          rating: 4,
          comment: "Muy buena herramienta de gestión de tareas",
          user: { name: "Ana López", avatar: "" },
          createdAt: new Date().toISOString()
        }
      ]);
    }
  },

  /**
   * Obtiene reseñas destacadas para la página de inicio
   * @param {number} limit - Límite de reseñas a obtener
   * @returns {Promise<Array>} Array de reseñas formateadas
   */
  async getFeaturedReviews(limit = 3) {
    try {
      const response = await apiHelper.get('/reviews/featured', {
        params: { limit }
      });
      return this.formatReviewsData(response.data);
    } catch (error) {
      console.error('Error getting featured reviews:', error);
      return this.getAllReviews(limit); // Fallback al método getAllReviews
    }
  },

  /**
   * Obtiene todas las reseñas con formateo y paginación
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite por página
   * @param {number} params.productId - ID del producto (opcional)
   * @param {string} params.sortBy - Campo de ordenamiento
   * @param {string} params.sortOrder - Orden (asc/desc)
   * @param {number} params.minRating - Filtro de rating mínimo
   * @param {number} params.maxRating - Filtro de rating máximo
   * @returns {Promise<Object>} Reviews formateadas con metadatos
   */
  async getFormattedReviews(params = {}) {
    try {
      const response = await apiHelper.get('/reviews', { params });
      
      return {
        reviews: this.formatReviewsData(response.data.reviews || response.data || []),
        pagination: response.data.pagination || null,
        totalCount: response.data.totalCount || 0,
        averageRating: response.data.averageRating || 0,
        ratingDistribution: response.data.ratingDistribution || {}
      };
    } catch (error) {
      console.error('Error obteniendo reviews:', error);
      return {
        reviews: [],
        pagination: null,
        totalCount: 0,
        averageRating: 0,
        ratingDistribution: {}
      };
    }
  },

  /**
   * Obtiene una reseña específica por ID
   * @param {number} reviewId - ID de la reseña
   * @returns {Promise<Object|null>} Reseña formateada o null
   */
  async getReviewById(reviewId) {
    try {
      const response = await apiHelper.get(`/reviews/${reviewId}`);
      return this.formatSingleReview(response.data);
    } catch (error) {
      console.error(`Error obteniendo review ${reviewId}:`, error);
      return null;
    }
  },

  /**
   * Obtiene reseñas de un producto específico
   * @param {number} productId - ID del producto
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Reviews del producto
   */
  async getProductReviews(productId, params = {}) {
    try {
      const response = await apiHelper.get(`/products/${productId}/reviews`, { params });
      
      return {
        reviews: this.formatReviewsData(response.data.reviews || response.data || []),
        productInfo: response.data.productInfo || null,
        reviewStats: response.data.stats || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {}
        }
      };
    } catch (error) {
      console.error(`Error obteniendo reviews del producto ${productId}:`, error);
      return {
        reviews: [],
        productInfo: null,
        reviewStats: { totalReviews: 0, averageRating: 0, ratingDistribution: {} }
      };
    }
  },

  /**
   * Crea una nueva reseña
   * @param {Object} reviewData - Datos de la reseña
   * @param {number} reviewData.productId - ID del producto
   * @param {number} reviewData.rating - Calificación (1-5)
   * @param {string} reviewData.comment - Comentario
   * @param {string} reviewData.title - Título (opcional)
   * @returns {Promise<Object>} Reseña creada
   */
  async createReview(reviewData) {
    try {
      // Validar datos antes de enviar
      this.validateReviewData(reviewData);
      
      // Preparar datos para envío
      const formattedData = {
        productId: reviewData.productId,
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment.trim(),
        title: reviewData.title?.trim() || null
      };

      const response = await apiHelper.post('/reviews', formattedData);
      return this.formatSingleReview(response.data);
    } catch (error) {
      console.error('Error creando review:', error);
      throw this.formatError(error);
    }
  },

  /**
   * Actualiza una reseña existente
   * @param {number} reviewId - ID de la reseña
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Reseña actualizada
   */
  async updateReview(reviewId, updateData) {
    try {
      this.validateReviewUpdateData(updateData);
      
      const formattedData = {
        ...updateData,
        rating: updateData.rating ? parseInt(updateData.rating) : undefined,
        comment: updateData.comment?.trim(),
        title: updateData.title?.trim()
      };

      const response = await apiHelper.put(`/reviews/${reviewId}`, formattedData);
      return this.formatSingleReview(response.data);
    } catch (error) {
      console.error(`Error actualizando review ${reviewId}:`, error);
      throw this.formatError(error);
    }
  },

  /**
   * Elimina una reseña
   * @param {number} reviewId - ID de la reseña
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async deleteReview(reviewId) {
    try {
      await apiHelper.delete(`/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando review ${reviewId}:`, error);
      throw this.formatError(error);
    }
  },

  /**
   * Marca una reseña como útil
   * @param {number} reviewId - ID de la reseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  async markReviewHelpful(reviewId) {
    try {
      const response = await apiHelper.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error(`Error marcando review ${reviewId} como útil:`, error);
      throw this.formatError(error);
    }
  },

  /**
   * Reporta una reseña
   * @param {number} reviewId - ID de la reseña
   * @param {string} reason - Razón del reporte
   * @param {string} description - Descripción adicional
   * @returns {Promise<Object>} Resultado del reporte
   */
  async reportReview(reviewId, reason, description = '') {
    try {
      const response = await apiHelper.post(`/reviews/${reviewId}/report`, {
        reason,
        description: description.trim()
      });
      return response.data;
    } catch (error) {
      console.error(`Error reportando review ${reviewId}:`, error);
      throw this.formatError(error);
    }
  },

  /**
   * Obtiene estadísticas de reseñas de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Estadísticas de reseñas
   */
  async getReviewStats(productId) {
    try {
      const response = await apiHelper.get(`/products/${productId}/reviews/stats`);
      return {
        totalReviews: response.data.totalReviews || 0,
        averageRating: response.data.averageRating || 0,
        ratingDistribution: response.data.ratingDistribution || {},
        monthlyTrend: response.data.monthlyTrend || [],
        topKeywords: response.data.topKeywords || []
      };
    } catch (error) {
      console.error(`Error obteniendo estadísticas de producto ${productId}:`, error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        monthlyTrend: [],
        topKeywords: []
      };
    }
  },

  // ===========================================
  // MÉTODOS DE FORMATEO Y TRANSFORMACIÓN
  // ===========================================

  /**
   * Formatea un array de reseñas
   * @param {Array} reviews - Array de reseñas sin formatear
   * @returns {Array} Array de reseñas formateadas
   */
  formatReviewsData(reviews) {
    if (!Array.isArray(reviews)) return [];
    
    return reviews.map(review => this.formatSingleReview(review));
  },

  /**
   * Formatea una reseña individual
   * @param {Object} review - Reseña sin formatear
   * @returns {Object} Reseña formateada
   */
  formatSingleReview(review) {
    if (!review) return null;

    return {
      id: review.id,
      title: review.title || '',
      content: review.content || review.comment || '',
      rating: parseInt(review.rating) || 0,
      user: {
        id: review.user?.id,
        name: review.user?.name || 
              `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 
              'Usuario Anónimo',
        initials: this.generateInitials(review.user),
        username: review.user?.username || '',
        avatar: review.user?.avatar || review.user?.profilePicture || '',
        isVerified: review.user?.isVerified || false
      },
      product: {
        id: review.product?.id || review.productId,
        name: review.product?.name || '',
        image: review.product?.image || review.product?.thumbnail || ''
      },
      dates: {
        created: review.createdAt || review.date,
        updated: review.updatedAt,
        formatted: this.formatDate(review.createdAt || review.date)
      },
      engagement: {
        helpfulVotes: review.helpfulVotes || 0,
        totalVotes: review.totalVotes || 0,
        views: review.views || 0,
        isHelpful: review.isHelpful || false
      },
      status: {
        isEdited: review.isEdited || false,
        isReported: review.isReported || false,
        isVerifiedPurchase: review.isVerifiedPurchase || false
      },
      metadata: {
        deviceUsed: review.deviceUsed || '',
        purchaseDate: review.purchaseDate,
        usagePeriod: review.usagePeriod || ''
      }
    };
  },

  /**
   * Genera iniciales del usuario
   * @param {Object} user - Objeto usuario
   * @returns {string} Iniciales del usuario
   */
  generateInitials(user) {
    if (!user) return 'UN';
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      return nameParts.length > 1 
        ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
    }
    
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    
    return (firstName + lastName).toUpperCase() || 'UN';
  },

  /**
   * Formatea fecha para mostrar
   * @param {string} dateString - Fecha en string
   * @returns {string} Fecha formateada
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // ===========================================
  // MÉTODOS DE VALIDACIÓN
  // ===========================================

  /**
   * Valida datos de nueva reseña
   * @param {Object} reviewData - Datos a validar
   * @throws {Error} Si los datos son inválidos
   */
  validateReviewData(reviewData) {
    const errors = [];

    if (!reviewData.productId || !Number.isInteger(reviewData.productId)) {
      errors.push('ID de producto es requerido y debe ser un número');
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('La calificación debe estar entre 1 y 5');
    }

    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      errors.push('El comentario debe tener al menos 10 caracteres');
    }

    if (reviewData.comment && reviewData.comment.trim().length > 1000) {
      errors.push('El comentario no puede exceder 1000 caracteres');
    }

    if (reviewData.title && reviewData.title.trim().length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    if (errors.length > 0) {
      throw new Error(`Datos inválidos: ${errors.join(', ')}`);
    }
  },

  /**
   * Valida datos de actualización de reseña
   * @param {Object} updateData - Datos a validar
   * @throws {Error} Si los datos son inválidos
   */
  validateReviewUpdateData(updateData) {
    const errors = [];

    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      errors.push('La calificación debe estar entre 1 y 5');
    }

    if (updateData.comment && updateData.comment.trim().length < 10) {
      errors.push('El comentario debe tener al menos 10 caracteres');
    }

    if (updateData.comment && updateData.comment.trim().length > 1000) {
      errors.push('El comentario no puede exceder 1000 caracteres');
    }

    if (updateData.title && updateData.title.trim().length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    if (errors.length > 0) {
      throw new Error(`Datos inválidos: ${errors.join(', ')}`);
    }
  },

  /**
   * Formatea errores de la API
   * @param {Error} error - Error original
   * @returns {Error} Error formateado
   */
  formatError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 401) {
      return new Error('Debes iniciar sesión para realizar esta acción');
    }
    
    if (error.response?.status === 403) {
      return new Error('No tienes permisos para realizar esta acción');
    }
    
    if (error.response?.status === 404) {
      return new Error('La reseña no fue encontrada');
    }
    
    if (error.response?.status >= 500) {
      return new Error('Error del servidor. Inténtalo más tarde');
    }
    
    return error;
  }
};

export default reviewService;
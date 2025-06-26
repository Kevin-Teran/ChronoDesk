/**
 * Controlador para manejar operaciones CRUD de reseñas
 * @module controllers/reviewController
 * @requires models/Review
 * @requires models/User
 */
 const { Review, User } = require('../models');
 const { Op } = require('sequelize');
 const createError = require('http-errors');
 
 /**
  * Crea una nueva reseña
  * @async
  * @function createReview
  * @param {Object} req - Request object
  * @param {Object} res - Response object
  * @param {Function} next - Next middleware
  */
 exports.createReview = async (req, res, next) => {
   try {
     const { rating, comment, productId } = req.body;
     const userId = req.user.id;
 
     // Validación adicional
     if (!rating || !comment || !productId) {
       throw createError.BadRequest('Faltan campos requeridos');
     }
 
     const review = await Review.create({
       rating,
       comment,
       userId,
       productId
     });
 
     // Incluir datos del usuario en la respuesta
     const reviewWithUser = await Review.findByPk(review.id, {
       include: [{
         model: User,
         as: 'user',
         attributes: ['id', 'firstName', 'lastName', 'username']
       }]
     });
 
     res.status(201).json({
       success: true,
       data: formatReview(reviewWithUser)
     });
   } catch (error) {
     next(error);
   }
 };
 
 /**
  * Obtiene todas las reseñas con paginación y filtros
  * @async
  * @function getAllReviews
  * @param {Object} req - Request object
  * @param {Object} res - Response object
  * @param {Function} next - Next middleware
  */
 exports.getAllReviews = async (req, res, next) => {
   try {
     const { page = 1, limit = 10, rating, search } = req.query;
     const offset = (page - 1) * limit;
 
     const where = {};
     if (rating) where.rating = { [Op.gte]: rating };
     if (search) where.comment = { [Op.iLike]: `%${search}%` };
 
     const { count, rows } = await Review.findAndCountAll({
       where,
       limit: parseInt(limit),
       offset: parseInt(offset),
       order: [['createdAt', 'DESC']],
       include: [{
         model: User,
         as: 'user',
         attributes: ['id', 'firstName', 'lastName', 'username']
       }]
     });
 
     res.json({
       success: true,
       data: rows.map(formatReview),
       pagination: {
         total: count,
         page: parseInt(page),
         pages: Math.ceil(count / limit),
         limit: parseInt(limit)
       }
     });
   } catch (error) {
     next(error);
   }
 };
 
 /**
  * Obtiene las reseñas más vistas
  * @async
  * @function getTopReviews
  * @param {Object} req - Request object
  * @param {Object} res - Response object
  * @param {Function} next - Next middleware
  */
 exports.getTopReviews = async (req, res, next) => {
   try {
     const limit = Math.min(parseInt(req.query.limit)) || 10;
     
     const reviews = await Review.findAll({
       order: [['views', 'DESC']],
       limit,
       include: [{
         model: User,
         as: 'user',
         attributes: ['id', 'firstName', 'lastName', 'username']
       }]
     });
 
     res.json({
       success: true,
       data: reviews.map(formatReview)
     });
   } catch (error) {
     next(error);
   }
 };
 
 /**
  * Formatea una reseña para la respuesta
  * @function formatReview
  * @param {Object} review - Objeto de reseña
  * @returns {Object} Reseña formateada
  */
 function formatReview(review) {
   return {
     id: review.id,
     rating: review.rating,
     content: review.comment,
     date: review.createdAt,
     views: review.views,
     helpfulVotes: review.helpfulVotes,
     user: {
       id: review.user.id,
       name: `${review.user.firstName} ${review.user.lastName}`,
       initials: `${review.user.firstName?.charAt(0) || ''}${review.user.lastName?.charAt(0) || ''}`,
       username: review.user.username
     },
     productId: review.productId
   };
 }
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

/**
 * Validation rules for review creation
 * @constant {Array}
 * @description Defines validation rules for review creation using express-validator
 * @property {Object} rating - Must be integer between 1-5
 * @property {Object} comment - Must be 10-2000 characters
 * @property {Object} productId - Must be valid integer
 */
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),
  body('productId')
    .isInt({ gt: 0 })
    .withMessage('Invalid product ID')
    .toInt()
];

/**
 * @typedef {Object} ReviewRoute
 * @property {function} get - Get all reviews
 * @property {function} get/top - Get top reviews
 * @property {function} post - Create new review
 */

/**
 * Review Routes
 * @module routes/reviews
 * @type {ReviewRoute}
 * 
 * @description Handles all review-related routes including:
 * - Getting all reviews
 * - Getting top-rated reviews
 * - Creating new reviews
 * 
 * All routes are prefixed with '/api/reviews'
 */
router
  /**
   * @name Get all reviews
   * @route {GET} /
   * @authentication None
   * @returns {Array.<Review>} 200 - List of reviews
   * @returns {Error} 500 - Server error
   */
  .get('/', reviewController.getAllReviews)

  /**
   * @name Get top reviews
   * @route {GET} /top
   * @authentication None
   * @returns {Array.<Review>} 200 - List of top-rated reviews
   * @returns {Error} 500 - Server error
   */
  .get('/top', reviewController.getTopReviews)

  /**
   * @name Create review
   * @route {POST} /
   * @authentication Required
   * @bodyparam {number} rating - Rating value (1-5)
   * @bodyparam {string} comment - Review comment
   * @bodyparam {number} productId - ID of product being reviewed
   * @returns {Review} 201 - Created review
   * @returns {Error} 400 - Validation error
   * @returns {Error} 401 - Unauthorized
   * @returns {Error} 500 - Server error
   */
  .post('/', 
    authMiddleware, 
    validate(reviewValidation), 
    reviewController.createReview
  );

module.exports = router;
/**
 * Middleware para validación de datos
 * @module middlewares/validateMiddleware
 * @requires express-validator
 */
 const { validationResult } = require('express-validator');

 /**
  * Middleware que valida los resultados de express-validator
  * @function
  * @param {Array} validations - Array de validaciones
  * @returns {Function} Middleware de validación
  */
 exports.validate = (validations) => {
   return async (req, res, next) => {
     await Promise.all(validations.map(validation => validation.run(req)));
 
     const errors = validationResult(req);
     if (errors.isEmpty()) {
       return next();
     }
 
     res.status(400).json({
       success: false,
       errors: errors.array()
     });
   };
 };
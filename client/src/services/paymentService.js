/**
 * @file paymentService.js
 * @description Servicio exclusivo para operaciones de pagos.
 * @module services/payment
 */

 import { apiHelper } from './api';

 // 🎯 Endpoints de la API
 const PAYMENT_ENDPOINT = '/payments';
 
 // 🔧 Configuración de entorno
 const SIMULATE_API = import.meta.env.MODE !== 'production';
 
 /**
  * @namespace paymentService
  * @description Servicio para operaciones relacionadas con pagos.
  */
 export const paymentService = {
   /**
    * Procesa un pago.
    * @param {Object} paymentData - Datos del pago.
    * @returns {Promise<Object>} Resultado del pago.
    */
   async processPayment(paymentData) {
     try {
       if (SIMULATE_API) {
         return this._simulatePayment(paymentData);
       }
 
       const response = await apiHelper.post(PAYMENT_ENDPOINT, paymentData);
       return response.data;
     } catch (error) {
       this._handlePaymentError(error);
     }
   },
 
   // 🔄 Métodos de simulación para desarrollo
   /**
    * Simula el procesamiento de un pago (solo desarrollo).
    * @private
    */
   async _simulatePayment(paymentData) {
     console.log('🔄 Simulando procesamiento de pago...', paymentData);
     
     if (!paymentData.planId || !paymentData.amount) {
       throw new Error('PAYMENT_INVALID_DATA');
     }
 
     if (paymentData.amount <= 0) {
       throw new Error('PAYMENT_INVALID_AMOUNT');
     }
 
     await new Promise(resolve => setTimeout(resolve, 1500));
 
     const isError = Math.random() < 0.1;
     if (isError) {
       throw new Error('PAYMENT_PROCESSING_ERROR');
     }
 
     return {
       success: true,
       paymentId: `pm_sim_${Math.random().toString(36).substr(2, 16)}`,
       amount: paymentData.amount,
       currency: paymentData.currency || 'COP',
       status: 'succeeded',
       timestamp: new Date().toISOString(),
       _simulated: true
     };
   },
 
   /**
    * Maneja errores de pago.
    * @private
    */
   _handlePaymentError(error) {
     console.error('[PaymentService] Payment error:', error);
 
     const errorMap = {
       PAYMENT_INVALID_DATA: {
         code: 400,
         message: 'Datos de pago incompletos o inválidos'
       },
       PAYMENT_INVALID_AMOUNT: {
         code: 400,
         message: 'El monto del pago debe ser mayor a cero'
       },
       PAYMENT_PROCESSING_ERROR: {
         code: 502,
         message: 'Error al procesar el pago con el proveedor'
       },
       default: {
         code: 500,
         message: 'Error desconocido en el procesamiento de pago'
       }
     };
 
     const errorKey = error.response?.data?.error || error.message;
     const errorInfo = errorMap[errorKey] || errorMap.default;
 
     const formattedError = new Error(errorInfo.message);
     formattedError.code = errorInfo.code;
     formattedError.originalError = error;
 
     throw formattedError;
   }
 };
 
 // 🔌 Interface pública alternativa
 export const processPayment = paymentService.processPayment.bind(paymentService);
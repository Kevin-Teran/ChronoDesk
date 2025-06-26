/**
 * @file planService.js
 * @description Servicio para operaciones relacionadas con planes.
 * @module services/plan
 */

 import { apiHelper } from './api';

 // 🎯 Endpoints de la API
 const PLANS_ENDPOINT = '/plans';
 
 // 🔧 Configuración de entorno
 const SIMULATE_API = import.meta.env.MODE !== 'production';
 
 /**
  * @namespace planService
  * @description Servicio para operaciones relacionadas con planes.
  */
 export const planService = {
   /**
    * Crea un nuevo plan.
    * @param {Object} planData - Datos del plan a crear.
    * @returns {Promise<Object>} Detalles del plan creado.
    */
   async createPlan(planData) {
     try {
       if (SIMULATE_API) {
         return this._simulateCreatePlan(planData);
       }
 
       const response = await apiHelper.post(PLANS_ENDPOINT, planData);
       return response.data;
     } catch (error) {
       this._handlePlanError(error);
     }
   },
 
   /**
    * Obtiene detalles de un plan específico.
    * @param {string} planId - ID del plan.
    * @returns {Promise<Object>} Detalles del plan.
    */
   async getPlanDetails(planId) {
     try {
       if (SIMULATE_API) {
         return this._simulateGetPlan(planId);
       }
 
       const response = await apiHelper.get(`${PLANS_ENDPOINT}/${planId}`);
       return response.data;
     } catch (error) {
       this._handlePlanError(error);
     }
   },
 
   /**
    * Obtiene todos los planes disponibles.
    * @returns {Promise<Array>} Lista de planes.
    */
   async getAllPlans() {
     try {
       if (SIMULATE_API) {
         return this._simulateGetAllPlans();
       }
 
       const response = await apiHelper.get(PLANS_ENDPOINT);
       return response.data;
     } catch (error) {
       this._handlePlanError(error);
     }
   },
 
   // 🔄 Métodos de simulación para desarrollo
   /**
    * Simula la creación de un plan (solo desarrollo).
    * @private
    */
   async _simulateCreatePlan(planData) {
     console.log('🔄 Simulando creación de plan...', planData);
     
     if (!planData.name || !planData.maxSupervisors || !planData.maxUsers) {
       throw new Error('PLAN_INVALID_DATA');
     }
 
     await new Promise(resolve => setTimeout(resolve, 800));
 
     const isError = Math.random() < 0.05;
     if (isError) {
       throw new Error('PLAN_CREATION_FAILED');
     }
     
     const mainToken = `tok_sim_${Math.random().toString(36).substr(2, 16)}_${Date.now()}`;
 
     return {
       success: true,
       planId: `plan_sim_${Math.random().toString(36).substr(2, 16)}`,
       name: planData.name,
       description: planData.description,
       startDate: planData.startDate,
       endDate: planData.endDate,
       maxSupervisors: planData.maxSupervisors,
       maxUsers: planData.maxUsers,
       mainToken,
       status: planData.status || 'active',
       createdBy: planData.createdBy,
       createdAt: new Date().toISOString(),
       _simulated: true
     };
   },
 
   /**
    * Simula la obtención de un plan (solo desarrollo).
    * @private
    */
   async _simulateGetPlan(planId) {
     console.log('🔄 Simulando obtención de plan...', planId);
     
     if (!planId) {
       throw new Error('PLAN_NOT_FOUND');
     }
 
     await new Promise(resolve => setTimeout(resolve, 500));
 
     return {
       success: true,
       plan: {
         id: planId,
         name: `Plan ${planId}`,
         description: 'Plan simulado para desarrollo',
         status: 'active',
         maxSupervisors: 10,
         maxUsers: 50,
         _simulated: true
       }
     };
   },
 
   /**
    * Simula la obtención de todos los planes (solo desarrollo).
    * @private
    */
   async _simulateGetAllPlans() {
     console.log('🔄 Simulando obtención de todos los planes...');
     
     await new Promise(resolve => setTimeout(resolve, 700));
 
     return {
       success: true,
       plans: [
         {
           id: 'plan_sim_1',
           name: 'Plan Básico',
           description: 'Plan básico simulado',
           status: 'active',
           maxSupervisors: 1,
           maxUsers: 5,
           _simulated: true
         },
         {
           id: 'plan_sim_2',
           name: 'Plan Avanzado',
           description: 'Plan avanzado simulado',
           status: 'active',
           maxSupervisors: 3,
           maxUsers: 15,
           _simulated: true
         }
       ]
     };
   },
 
   /**
    * Maneja errores de planes.
    * @private
    */
   _handlePlanError(error) {
     console.error('[PlanService] Plan error:', error);
 
     const errorMap = {
       PLAN_NOT_FOUND: {
         code: 404,
         message: 'El plan solicitado no existe'
       },
       PLAN_CREATION_FAILED: {
         code: 422,
         message: 'No se pudo crear el plan'
       },
       PLAN_INVALID_DATA: {
         code: 400,
         message: 'Datos del plan incompletos o inválidos'
       },
       default: {
         code: 500,
         message: 'Error en el servicio de planes'
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
 
 // 🔌 Interfaces públicas alternativas
 export const createPlan = planService.createPlan.bind(planService);
 export const getPlanDetails = planService.getPlanDetails.bind(planService);
 export const getAllPlans = planService.getAllPlans.bind(planService);
const Plan = require('../models/Plan');

/**
 * Crea un nuevo plan en el sistema.
 * @param {Object} req - Objeto de solicitud Express con los datos del plan en el body.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con el plan creado o mensaje de error.
 * @throws {Error} Si ocurre un error al crear el plan.
 */
exports.createPlan = async (req, res) => {
  try {
    // Validación básica de campos requeridos
    const requiredFields = ['name', 'description', 'maxUsers', 'status'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        missingFields
      });
    }

    // Crear el plan con datos validados
    const plan = await Plan.create({
      name: req.body.name,
      description: req.body.description,
      maxUsers: req.body.maxUsers,
      maxSupervisors: req.body.maxSupervisors || 0,
      status: req.body.status || 'active',
      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate,
      isExtension: req.body.isExtension || false,
      mainToken: req.body.mainToken || crypto.randomBytes(16).toString('hex')
    });

    res.status(201).json({
      message: 'Plan creado exitosamente',
      plan
    });
  } catch (err) {
    console.error('Error al crear plan:', err);
    res.status(500).json({
      error: 'Error interno del servidor al crear plan',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Obtiene todos los planes disponibles en el sistema.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con el listado de planes.
 * @throws {Error} Si ocurre un error al obtener los planes.
 */
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['createdAt', 'DESC']], // Ordenar por fecha de creación descendente
      attributes: { exclude: ['mainToken'] } // Excluir información sensible
    });

    res.json({
      count: plans.length,
      plans
    });
  } catch (err) {
    console.error('Error al obtener planes:', err);
    res.status(500).json({
      error: 'Error interno del servidor al obtener planes',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Actualiza un plan existente.
 * @param {Object} req - Objeto de solicitud Express con el ID en params y datos en body.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con el plan actualizado o mensaje de error.
 * @throws {Error} Si ocurre un error al actualizar el plan.
 */
exports.updatePlan = async (req, res) => {
  try {
    // Validar ID del plan
    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({ error: 'ID de plan inválido' });
    }

    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    // Campos que no deberían ser actualizables
    const protectedFields = ['id', 'createdAt', 'mainToken'];
    const updateData = { ...req.body };
    protectedFields.forEach(field => delete updateData[field]);

    // Validar datos antes de actualizar
    if (updateData.maxUsers && updateData.maxUsers < 1) {
      return res.status(400).json({ error: 'maxUsers debe ser al menos 1' });
    }

    await plan.update(updateData);

    res.json({
      message: 'Plan actualizado exitosamente',
      plan
    });
  } catch (err) {
    console.error('Error al actualizar plan:', err);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar plan',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Elimina un plan del sistema.
 * @param {Object} req - Objeto de solicitud Express con el ID del plan en params.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON confirmando la eliminación o mensaje de error.
 * @throws {Error} Si ocurre un error al eliminar el plan.
 */
exports.deletePlan = async (req, res) => {
  try {
    // Validar ID del plan
    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({ error: 'ID de plan inválido' });
    }

    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    // Verificar si hay usuarios asociados al plan
    const usersCount = await User.count({ where: { planId: plan.id } });
    if (usersCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el plan porque tiene usuarios asociados',
        usersCount
      });
    }

    await plan.destroy();

    res.json({
      message: 'Plan eliminado exitosamente',
      planId: req.params.id,
      deletedAt: new Date()
    });
  } catch (err) {
    console.error('Error al eliminar plan:', err);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar plan',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
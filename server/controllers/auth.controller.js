const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const crypto = require('crypto');
const User = require('../models/User');
const Plan = require('../models/plan');
const LoginLog = require('../models/loginLog');
const { 
  validateRegisterFields, 
  validateLoginFields,
  validateSecretKeyInput,
  sanitizeInput,
  validateAndSanitizeRegisterData,
  getPasswordStrength 
} = require('../utils/validateFields');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Genera un token JWT con datos esenciales del usuario.
 * @param {Object} user - Objeto usuario que debe contener al menos id, role y username.
 * @param {string} expiresIn - Duración del token, ejemplo: '1h', '7d'.
 * @returns {string} Token JWT firmado.
 * @throws {Error} Si el usuario es inválido o no tiene id.
 */
const generateToken = (user, expiresIn = '1h') => {
  if (!user || !user.id) {
    throw new Error('Usuario inválido para generar token');
  }

  const payload = {
    id: user.id,
    role: user.role || 'user',
    username: user.username || '',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Valida una clave secreta de plan y devuelve información sobre roles disponibles.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con estado de validación y datos del plan.
 */
exports.validateSecretKey = async (req, res) => {
  try {
    const { secretKey } = req.body;

    if (!secretKey || !secretKey.trim()) {
      return res.status(400).json({ error: 'La clave secreta es requerida.' });
    }

    const plan = await Plan.findOne({ 
      where: { mainToken: secretKey.trim() } 
    });
    
    if (!plan) {
      return res.status(400).json({ error: 'Clave secreta no válida.' });
    }

    const now = new Date();
    if (plan.status !== 'active') {
      return res.status(400).json({ error: 'El plan asociado a esta clave no está activo.' });
    }

    if (plan.endDate && new Date(plan.endDate) < now) {
      return res.status(400).json({ error: 'El plan asociado a esta clave ha expirado.' });
    }

    const usersCount = await User.count({ 
      where: { planId: plan.id, role: 'user' } 
    });
    const supervisorsCount = await User.count({ 
      where: { planId: plan.id, role: 'supervisor' } 
    });

    const roles = [];
    
    if (usersCount < plan.maxUsers) {
      roles.push('user');
    }
    
    if (plan.maxSupervisors > 0 && supervisorsCount < plan.maxSupervisors) {
      roles.push('supervisor');
    }

    if (roles.length === 0) {
      return res.status(400).json({ 
        error: 'Este plan ha alcanzado el límite máximo de usuarios permitidos.' 
      });
    }

    return res.status(200).json({
      message: 'Clave secreta válida',
      roles,
      planName: plan.name,
      availableSlots: {
        users: plan.maxUsers - usersCount,
        supervisors: plan.maxSupervisors - supervisorsCount
      }
    });
  } catch (error) {
    console.error('Error validando clave secreta:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Registra un nuevo usuario en el sistema.
 * @param {Object} req - Objeto de solicitud Express con datos del usuario.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con resultado del registro.
 */
exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, username, email, phone, password,
      secretKey, role
    } = req.body;

    const validation = validateAndSanitizeRegisterData({
      firstName, lastName, username, email, phone, password, secretKey, role
    });

    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const sanitizedData = validation.data;

    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: sanitizedData.email }, 
          { username: sanitizedData.username }
        ] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email o username.' });
    }

    let finalRole = 'user';
    let planId = null;

    if (sanitizedData.secretKey && sanitizedData.secretKey.trim()) {
      const secretKeyErrors = validateSecretKeyInput(sanitizedData.secretKey);
      if (secretKeyErrors.length > 0) {
        return res.status(400).json({ errors: secretKeyErrors });
      }

      const plan = await Plan.findOne({ 
        where: { mainToken: sanitizedData.secretKey.trim() } 
      });
      
      if (!plan) {
        return res.status(400).json({ error: 'Clave de plan no válida.' });
      }

      const now = new Date();
      if (plan.status !== 'active') {
        return res.status(400).json({ error: 'El plan asociado no está activo.' });
      }
      
      if (plan.endDate && new Date(plan.endDate) < now) {
        return res.status(400).json({ error: 'El plan asociado ha expirado.' });
      }

      if (!sanitizedData.role || !['user', 'supervisor'].includes(sanitizedData.role)) {
        return res.status(400).json({ error: 'Rol inválido para el plan seleccionado.' });
      }

      const usersInPlan = await User.count({ 
        where: { planId: plan.id, role: 'user' } 
      });
      const supervisorsInPlan = await User.count({ 
        where: { planId: plan.id, role: 'supervisor' } 
      });

      if (sanitizedData.role === 'user' && usersInPlan >= plan.maxUsers) {
        return res.status(400).json({ 
          error: `Este plan ya alcanzó el número máximo de usuarios permitidos (${plan.maxUsers}).` 
        });
      }

      if (sanitizedData.role === 'supervisor') {
        if (plan.maxSupervisors === 0) {
          return res.status(400).json({ 
            error: 'Este plan no permite supervisores.' 
          });
        }
        if (supervisorsInPlan >= plan.maxSupervisors) {
          return res.status(400).json({ 
            error: `Este plan ya alcanzó el número máximo de supervisores permitidos (${plan.maxSupervisors}).` 
          });
        }
      }

      finalRole = sanitizedData.role;
      planId = plan.id;
    } else {
      // Sin clave secreta: crear plan básico automático
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(now.getMonth() + 1);

      const newPlan = await Plan.create({
        name: `Plan básico de ${sanitizedData.username}`,
        description: 'Plan básico generado automáticamente',
        startDate: now,
        endDate: oneMonthLater,
        mainToken: crypto.randomBytes(16).toString('hex'),
        isExtension: false,
        maxSupervisors: 0,
        maxUsers: 1,
        status: 'active'
      });

      planId = newPlan.id;
    }

    // Crear usuario
    const user = await User.create({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      username: sanitizedData.username,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      password,
      role: finalRole,
      isActive: true,
      createdBy: 'system',
      loginCount: 0,
      planId,
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      planId
    });
  } catch (err) {
    console.error('Error en el registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo más tarde.' });
  }
};

/**
 * Autentica a un usuario y genera un token de acceso.
 * @param {Object} req - Objeto de solicitud Express con credenciales.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con token y datos del usuario.
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    console.log('=== INICIO DEBUG LOGIN ===');
    console.log('Datos recibidos:', { identifier, hasPassword: !!password, rememberMe });

    const loginErrors = validateLoginFields({ identifier, password });
    if (loginErrors.length > 0) {
      console.log('Errores de validación:', loginErrors);
      return res.status(400).json({ errors: loginErrors });
    }

    const sanitizedIdentifier = sanitizeInput(identifier).toLowerCase();
    console.log('Identifier saneado:', sanitizedIdentifier);

    // Buscar usuario con más información para debug
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: sanitizedIdentifier },
          { email: sanitizedIdentifier }
        ]
      },
      attributes: ['id', 'email', 'username', 'password', 'planId', 'role', 'isActive', 'firstName', 'lastName', 'loginCount', 'createdAt', 'updatedAt'],
      include: [{
        model: Plan,
        attributes: ['id', 'name', 'status', 'endDate', 'startDate', 'maxUsers', 'maxSupervisors'],
        required: false
      }]
    });    

    console.log('Usuario encontrado:', user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      planId: user.planId,
      hasPassword: !!user.password,
      plan: user.Plan ? {
        id: user.Plan.id,
        name: user.Plan.name,
        status: user.Plan.status,
        endDate: user.Plan.endDate
      } : 'NO PLAN'
    } : 'NO ENCONTRADO');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(400).json({ error: 'Usuario no encontrado.' });
    }

    if (!user.isActive) {
      console.log('❌ Usuario inactivo');
      return res.status(403).json({ error: 'Cuenta inactiva. Contacta al soporte.' });
    }

    if (!user.password) {
      console.log('❌ Usuario sin contraseña en BD');
      return res.status(500).json({ error: 'Error interno: contraseña faltante' });
    }

    // Verificar contraseña
    console.log('Comparando contraseñas...');
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña coincide?', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(400).json({ error: 'Contraseña incorrecta.' });
    }

    // Verificar plan - LÓGICA MEJORADA
    if (user.planId) {
      const plan = user.Plan || await Plan.findByPk(user.planId);
      console.log('Verificando plan:', plan ? {
        id: plan.id,
        name: plan.name,
        status: plan.status,
        endDate: plan.endDate,
        startDate: plan.startDate
      } : 'PLAN NO ENCONTRADO');

      if (!plan) {
        console.log('❌ Plan no encontrado para el usuario');
        // En lugar de fallar, crear un plan básico automático
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        const newPlan = await Plan.create({
          name: `Plan de emergencia - ${user.username}`,
          description: 'Plan creado automáticamente por falta de plan original',
          startDate: now,
          endDate: oneMonthLater,
          mainToken: crypto.randomBytes(16).toString('hex'),
          isExtension: false,
          maxSupervisors: 0,
          maxUsers: 1,
          status: 'active'
        });

        // Actualizar usuario con el nuevo plan
        await user.update({ planId: newPlan.id });
        console.log('✅ Plan de emergencia creado:', newPlan.id);
      } else {
        const now = new Date();
        console.log('Fecha actual:', now);
        console.log('Plan end date:', plan.endDate);
        console.log('Plan status:', plan.status);

        // Verificar si el plan está activo y no ha expirado
        const isExpired = plan.endDate && new Date(plan.endDate) < now;
        const isInactive = plan.status !== 'active';

        console.log('¿Plan expirado?', isExpired);
        console.log('¿Plan inactivo?', isInactive);

        if (isInactive) {
          console.log('❌ Plan inactivo');
          return res.status(403).json({ 
            error: 'Su plan está inactivo. Contacte al administrador.' 
          });
        }

        if (isExpired) {
          console.log('❌ Plan expirado');
          return res.status(403).json({ 
            error: 'Su plan ha expirado. Contacte al administrador para renovarlo.' 
          });
        }
      }
    } else {
      console.log('⚠️ Usuario sin planId, creando plan automático...');
      // Usuario sin plan, crear uno automático
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(now.getMonth() + 1);

      const newPlan = await Plan.create({
        name: `Plan automático - ${user.username}`,
        description: 'Plan creado automáticamente',
        startDate: now,
        endDate: oneMonthLater,
        mainToken: crypto.randomBytes(16).toString('hex'),
        isExtension: false,
        maxSupervisors: 0,
        maxUsers: 1,
        status: 'active'
      });

      await user.update({ planId: newPlan.id });
      console.log('✅ Plan automático creado:', newPlan.id);
    }

    // Generar token
    console.log('Generando token...');
    const token = generateToken(user, rememberMe ? '7d' : '1h');
    console.log('Token generado exitosamente');

    // Registrar login
    try {
      await LoginLog.create({
        userId: user.id,
        isActiveSession: true,
        sessionToken: token,
        loginTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      console.log('✅ LoginLog creado');
    } catch (logError) {
      console.error('Error creando LoginLog (no crítico):', logError);
    }

    // Actualizar estadísticas del usuario
    try {
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
      console.log('✅ Estadísticas de usuario actualizadas');
    } catch (statsError) {
      console.error('Error actualizando estadísticas (no crítico):', statsError);
    }

    console.log('=== LOGIN EXITOSO ===');
    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName    
      }
    });
  } catch (error) {
    console.error('❌ Error crítico en login:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo más tarde.' });
  }
};

/**
 * Cierra la sesión del usuario actual.
 * @param {Object} req - Objeto de solicitud Express con token de autenticación.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con resultado del cierre de sesión.
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const [updatedCount] = await LoginLog.update(
      { 
        isActiveSession: false, 
        logoutTime: new Date(),
        closedReason: 'logout'
      }, 
      {
        where: {
          userId: userId,
          sessionToken: token,
          isActiveSession: true
        }
      }
    );

    if (updatedCount === 0) {
      console.log('⚠️ Sesión activa no encontrada para cerrar, pero continuando...');
    }

    res.json({ message: 'Cierre de sesión exitoso' });
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Obtiene el perfil del usuario autenticado.
 * @param {Object} req - Objeto de solicitud Express con usuario autenticado.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con datos del perfil del usuario.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'role', 'isActive', 'loginCount'],
      include: [{
        model: Plan,
        attributes: ['name', 'endDate', 'status'],
        required: false
      }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const lastLogin = await LoginLog.findOne({
      where: { userId: user.id },
      order: [['loginTime', 'DESC']],
      attributes: ['loginTime']
    });

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,   
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: lastLogin ? lastLogin.loginTime : null,
        loginCount: user.loginCount,
        plan: user.Plan ? {
          name: user.Plan.name,
          endDate: user.Plan.endDate,
          status: user.Plan.status
        } : null
      }
    });
  } catch (err) {
    console.error('Error al obtener el perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Evalúa la fortaleza de una contraseña.
 * @param {Object} req - Objeto de solicitud Express con contraseña a evaluar.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Promise<Object>} Respuesta JSON con análisis de fortaleza de la contraseña.
 */
exports.checkPasswordStrength = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida.' });
    }

    const strength = getPasswordStrength(password);
    
    return res.json({
      strength: strength.strength,
      score: strength.score,
      suggestions: strength.suggestions
    });
  } catch (error) {
    console.error('Error verificando fortaleza de contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const refreshTokens = new Set();

/**
 * Genera un token de acceso JWT.
 * @param {Object} user - Objeto usuario con id, role y username.
 * @param {string} [expiresIn=process.env.ACCESS_TOKEN_EXPIRY] - Tiempo de expiración del token.
 * @returns {string} Token JWT firmado.
 */
const generateAccessToken = (user, expiresIn = process.env.ACCESS_TOKEN_EXPIRY) => {
  const payload = { id: user.id, role: user.role, username: user.username };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Genera un token de refresco JWT.
 * @param {Object} user - Objeto usuario con id.
 * @returns {string} Token JWT de refresco firmado.
 */
const generateRefreshToken = (user) => {
  const payload = { id: user.id };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });
  refreshTokens.add(token);
  return token;
};

/**
 * Renueva un token de acceso usando un token de refresco válido.
 * @param {Object} req - Objeto de solicitud Express con token de refresco.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Object} Respuesta JSON con nuevo token de acceso o mensaje de error.
 */
exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Refresh token requerido' });
  if (!refreshTokens.has(token)) return res.status(403).json({ error: 'Token inválido o revocado' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(decoded);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Refresh token inválido o expirado' });
  }
};
const jwt = require('jsonwebtoken');
const Plan = require('../models/plan');
const User = require('../models/User');
const LoginLog = require('../models/loginLog');

/**
 * Authentication middleware that verifies JWT tokens and checks user session status.
 * @module middlewares/authMiddleware
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authentication succeeds or sends error response
 * 
 * @description
 * This middleware performs the following actions:
 * 1. Extracts JWT token from Authorization header
 * 2. Verifies token validity and decodes payload
 * 3. Checks for active session in LoginLog
 * 4. Validates user status and plan details
 * 5. Attaches user data to request object if successful
 * 
 * @throws {401} If token is missing/invalid/expired
 * @throws {403} If user is inactive or plan is invalid
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validate Authorization header format
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(403).json({ 
      error: 'Token de acceso requerido',
      solution: 'Incluya un token válido en el encabezado Authorization: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('=== VERIFICANDO TOKEN EN MIDDLEWARE ===');
    console.log('Token recibido:', token.substring(0, 20) + '...');

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
      exp: new Date(decoded.exp * 1000), // Convert to readable date
      iat: new Date(decoded.iat * 1000), // Convert to readable date
      jti: decoded.jti // Unique token identifier
    });

    // Check for active session in login logs
    const activeSession = await LoginLog.findOne({
      where: {
        userId: decoded.id,
        sessionToken: token,
        isActiveSession: true
      },
      attributes: ['id', 'loginTime', 'ipAddress'] // Only get necessary fields
    });

    if (!activeSession) {
      console.log('❌ Sesión no encontrada o inactiva en LoginLog');
      return res.status(401).json({ 
        error: 'Sesión inválida o expirada',
        action: 'Por favor inicie sesión nuevamente'
      });
    }

    console.log('✅ Sesión activa encontrada en LoginLog');

    // Get user with plan information
    const user = await User.findByPk(decoded.id, {
      include: [{ 
        model: Plan,
        required: false,
        attributes: ['id', 'name', 'status', 'startDate', 'endDate'] // Sensitive fields excluded
      }],
      attributes: { exclude: ['password'] } // Never return password hash
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      await LoginLog.update(
        { 
          isActiveSession: false, 
          logoutTime: new Date(),
          closedReason: 'user_not_found'
        },
        { where: { id: activeSession.id } }
      );
      return res.status(403).json({ 
        error: 'Usuario no encontrado',
        action: 'Contacte al administrador del sistema'
      });
    }

    // Validate user status
    if (!user.isActive) {
      console.log('❌ Usuario inactivo');
      await LoginLog.update(
        { 
          isActiveSession: false, 
          logoutTime: new Date(),
          closedReason: 'user_inactive'
        },
        { where: { id: activeSession.id } }
      );
      return res.status(403).json({ 
        error: 'Usuario inactivo',
        action: 'Contacte al administrador para reactivar su cuenta'
      });
    }

    // Validate plan status if exists
    if (user.planId) {
      const plan = user.Plan || await Plan.findByPk(user.planId, {
        attributes: ['id', 'status', 'endDate'] // Only necessary fields
      });

      if (!plan) {
        console.log('❌ Plan no encontrado para planId:', user.planId);
        await LoginLog.update(
          { 
            isActiveSession: false, 
            logoutTime: new Date(),
            closedReason: 'plan_not_found'
          },
          { where: { id: activeSession.id } }
        );
        return res.status(403).json({ 
          error: 'Plan no asociado al usuario',
          action: 'Contacte al administrador del sistema'
        });
      }

      const now = new Date();
      const isExpired = plan.endDate && new Date(plan.endDate) < now;
      const isInactive = plan.status !== 'active';

      console.log('Verificando plan:', {
        planId: plan.id,
        status: plan.status,
        endDate: plan.endDate,
        isExpired,
        isInactive
      });

      if (isInactive || isExpired) {
        const reason = isInactive ? 'plan_inactive' : 'plan_expired';
        const message = isInactive ? 'Su plan está inactivo' : 'Su plan ha expirado';
        
        console.log(`❌ Plan ${reason}`);
        await LoginLog.update(
          { 
            isActiveSession: false, 
            logoutTime: new Date(),
            closedReason: reason
          },
          { where: { id: activeSession.id } }
        );
        return res.status(403).json({ 
          error: message,
          action: 'Contacte al administrador para renovar su plan'
        });
      }
    }

    // Update last activity timestamp (non-critical operation)
    try {
      await LoginLog.update(
        { lastActivityAt: new Date() },
        { where: { id: activeSession.id } }
      );
    } catch (updateError) {
      console.error('Error actualizando última actividad (no crítico):', updateError);
    }

    // Attach minimal user data to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      sessionId: activeSession.id // For session tracking
    };

    console.log('✅ Middleware completado exitosamente');
    next();
  } catch (err) {
    console.error('❌ Error verificando token:', err);
    
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      try {
        await LoginLog.update(
          { 
            isActiveSession: false, 
            logoutTime: new Date(),
            closedReason: err.name === 'TokenExpiredError' ? 'token_expired' : 'token_invalid'
          },
          { 
            where: { 
              sessionToken: token,
              isActiveSession: true 
            } 
          }
        );
      } catch (updateError) {
        console.error('Error marcando sesión como inactiva:', updateError);
      }
      
      const errorMessage = err.name === 'TokenExpiredError' 
        ? 'Token expirado' 
        : 'Token inválido';
      
      return res.status(401).json({ 
        error: errorMessage,
        action: 'Por favor inicie sesión nuevamente'
      });
    }
    
    // Handle other unexpected errors
    return res.status(500).json({ 
      error: 'Error de autenticación',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoginLog = sequelize.define('LoginLog', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  isActiveSession: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  logoutTime: {
    type: DataTypes.DATE,
  },

  ipAddress: {
    type: DataTypes.STRING,
    comment: 'IP desde la que se inició sesión',
  },

  userAgent: {
    type: DataTypes.STRING,
    comment: 'Navegador o app usada para el login',
  },

  sessionToken: {
    type: DataTypes.STRING,
    comment: 'Token generado al iniciar sesión (opcional)',
  },

  closedReason: {
    type: DataTypes.STRING,
    comment: 'Motivo de cierre de sesión: logout, expiración, revocado, etc.',
  },

}, {
  timestamps: true,
});

module.exports = LoginLog;
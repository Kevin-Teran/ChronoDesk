const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario al que pertenece la tarea',
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  type: {
    type: DataTypes.ENUM('event', 'reminder', 'task'),
    defaultValue: 'task',
  },

  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },

  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled'),
    defaultValue: 'pending',
  },

  dueDate: {
    type: DataTypes.DATE,
  },

  completedAt: {
    type: DataTypes.DATE,
    comment: 'Cuándo se marcó como completada',
  },

  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  recurrencePattern: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ej: daily, weekly, monthly (si aplica)',
  },

}, {
  timestamps: true, 
});

module.exports = Task;
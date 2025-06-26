const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Plan = sequelize.define('Plan', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Básico', 
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: 'Plan Básico', 
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, 
  },
  endDate: {
    type: DataTypes.DATE,
  },
  maxSupervisors: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  mainToken: {
    type: DataTypes.STRING,
    unique: true,
  },
  isExtension: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  originalEndDate: {
    type: DataTypes.DATE,
  },
  extendedBy: {
    type: DataTypes.STRING,
  },
  extendedAt: {
    type: DataTypes.DATE,
  },
  createdBy: {
    type: DataTypes.STRING,
    defaultValue: 'system',
  },
  updatedBy: {
    type: DataTypes.STRING, 
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'inactive'),
    defaultValue: 'active',
  },
}, {
  timestamps: true, 
});

module.exports = Plan;

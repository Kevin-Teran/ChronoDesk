const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  visibility: {
    type: DataTypes.ENUM('private', 'group', 'plan', 'role', 'global'),  // CORREGIDO
    defaultValue: 'private',
  },
  userId: {   
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  group: {    
    type: DataTypes.JSON,  
    allowNull: true,
  },
  planIds: { 
    type: DataTypes.JSON,  
    allowNull: true,
  },
  roleTargets: {  
    type: DataTypes.JSON,  
    allowNull: true,
    validate: {
      isValidRoleTargets(value) {
        if (value && !value.every(v => ['user', 'supervisor'].includes(v))) {
          throw new Error('Valores inválidos en roleTargets');
        }
      }
    }
  },
  senderId: {   
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'recipient',
    constraints: false,
  });

  Notification.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender',
    constraints: false,
  });
};

module.exports = Notification;
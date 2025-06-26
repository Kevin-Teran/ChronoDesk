const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  helpfulVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {  // o planId, según contexto
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
});

Review.associate = models => {
  Review.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = Review;

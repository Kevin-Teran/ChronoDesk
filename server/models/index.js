const sequelize = require("../config/db");
const User = require("./User");
const Task = require("./Task");
const Review = require("./Review");
const LoginLog = require("./LoginLog");
const Plan = require("./Plan");
const Notification = require("./Notification");

// Relaciones
User.hasMany(Task, { foreignKey: "userId" });
Task.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

User.hasMany(LoginLog, { foreignKey: "userId" });
LoginLog.belongsTo(User, { foreignKey: "userId" });

Plan.hasMany(User, { foreignKey: "planId" });
User.belongsTo(Plan, { foreignKey: "planId" });

User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  Task,
  Review,
  LoginLog,
  Plan,
  Notification,
};

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes para AES-256
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text) return null;
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const User = sequelize.define('User', {
  firstName: { 
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('firstName', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('firstName');
      try {
        return decrypt(encrypted);
      } catch {
        return null;
      }
    }
  },
  lastName: { 
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('lastName', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('lastName');
      try {
        return decrypt(encrypted);
      } catch {
        return null;
      }
    }
  },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: {
    type: DataTypes.STRING,
    set(value) {
      if (value) this.setDataValue('phone', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('phone');
      try {
        return decrypt(encrypted);
      } catch {
        return null;
      }
    }
  },
  role: { type: DataTypes.ENUM('admin', 'supervisor', 'user'), defaultValue: 'user' },
  password: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  planId: {
    type: DataTypes.INTEGER,
    references: { model: 'Plan', key: 'id' },
    allowNull: false
  }, 
  lastLoginAt: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.LoginLogs?.length) {
        const sorted = this.LoginLogs.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
        return sorted[0].loginTime;
      }
      return null;
    }
  },
  loginCount: { type: DataTypes.INTEGER, defaultValue: 0 }, // incrementar en lógica de login
  createdBy: { type: DataTypes.STRING },
  updatedBy: { type: DataTypes.STRING },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

module.exports = User;
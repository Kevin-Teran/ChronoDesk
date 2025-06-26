const crypto = require('crypto');

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const IV = Buffer.from(process.env.ENCRYPTION_IV, 'hex'); // Asegúrate de definir esto

module.exports = function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
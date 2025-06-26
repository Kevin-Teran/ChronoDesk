/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
 const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Validar contraseña fuerte
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si la contraseña es fuerte
 */
const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // Al menos 6 caracteres, una minúscula, una mayúscula y un número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

/**
 * Validar formato de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si el formato es válido
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Permitir números, espacios, guiones, paréntesis y signo +
  // Mínimo 8 dígitos
  const regex = /^\+?[\d\s\-\(\)]{8,}$/;
  return regex.test(phone.trim());
};

/**
 * Validar nombre de usuario
 * @param {string} username - Username a validar
 * @returns {boolean} True si es válido
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  
  const trimmed = username.trim();
  // Al menos 3 caracteres, solo letras, números, puntos y guiones bajos
  const regex = /^[a-zA-Z0-9._]{3,}$/;
  return regex.test(trimmed);
};

/**
 * Validar nombre (firstName/lastName)
 * @param {string} name - Nombre a validar
 * @returns {boolean} True si es válido
 */
const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  // Al menos 2 caracteres, solo letras y espacios
  const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,}$/;
  return regex.test(trimmed);
};

/**
 * Validar campos de registro
 * @param {Object} fields - Campos a validar
 * @param {string} fields.firstName - Nombre
 * @param {string} fields.lastName - Apellido
 * @param {string} fields.username - Nombre de usuario
 * @param {string} fields.email - Email
 * @param {string} fields.phone - Teléfono
 * @param {string} fields.password - Contraseña
 * @returns {Array} Array de errores encontrados
 */
const validateRegisterFields = ({ firstName, lastName, username, email, phone, password }) => {
  const errors = [];

  // Validar campos requeridos
  if (!firstName || !firstName.toString().trim()) {
    errors.push('El nombre es obligatorio.');
  } else if (!isValidName(firstName)) {
    errors.push('El nombre debe tener al menos 2 caracteres y solo contener letras.');
  }

  if (!lastName || !lastName.toString().trim()) {
    errors.push('El apellido es obligatorio.');
  } else if (!isValidName(lastName)) {
    errors.push('El apellido debe tener al menos 2 caracteres y solo contener letras.');
  }

  if (!username || !username.toString().trim()) {
    errors.push('El nombre de usuario es obligatorio.');
  } else if (!isValidUsername(username)) {
    errors.push('El nombre de usuario debe tener al menos 3 caracteres y solo contener letras, números, puntos y guiones bajos.');
  }

  if (!email || !email.toString().trim()) {
    errors.push('El email es obligatorio.');
  } else if (!isValidEmail(email)) {
    errors.push('El formato del email no es válido.');
  }

  if (!phone || !phone.toString().trim()) {
    errors.push('El teléfono es obligatorio.');
  } else if (!isValidPhone(phone)) {
    errors.push('El formato del teléfono no es válido.');
  }

  if (!password) {
    errors.push('La contraseña es obligatoria.');
  } else if (!isStrongPassword(password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.');
  }

  return errors;
};

/**
 * Validar campos de login
 * @param {Object} fields - Campos a validar
 * @param {string} fields.identifier - Usuario o email
 * @param {string} fields.password - Contraseña
 * @returns {Array} Array de errores encontrados
 */
const validateLoginFields = ({ identifier, password }) => {
  const errors = [];

  if (!identifier || !identifier.toString().trim()) {
    errors.push('El usuario o email es obligatorio.');
  }

  if (!password) {
    errors.push('La contraseña es obligatoria.');
  }

  return errors;
};

/**
 * Validar clave secreta
 * @param {string} secretKey - Clave secreta
 * @param {string} planType - Tipo de plan (ej. "free", "premium")
 * @returns {Array} Array de errores encontrados
 */
 const validateSecretKeyInput = (secretKey) => {
  const errors = [];
  if (!secretKey || typeof secretKey !== 'string' || !secretKey.trim()) {
    errors.push('La clave secreta es requerida.');
  } else if (secretKey.trim().length < 8) {
    errors.push('La clave secreta debe tener al menos 8 caracteres.');
  }
  return errors;
};


/**
 * Sanear entrada de texto
 * @param {string} input - Texto a sanear
 * @returns {string} Texto saneado
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .substring(0, 255); // Limitar longitud
};

/**
 * Validar y sanear datos de registro
 * @param {Object} data - Datos a validar y sanear
 * @returns {Object} Objeto con datos saneados y errores
 */
const validateAndSanitizeRegisterData = (data) => {
  const sanitized = {
    firstName: sanitizeInput(data.firstName),
    lastName: sanitizeInput(data.lastName),
    username: sanitizeInput(data.username).toLowerCase(),
    email: sanitizeInput(data.email).toLowerCase(),
    phone: sanitizeInput(data.phone),
    password: data.password, // No sanear contraseñas
    secretKey: data.secretKey ? sanitizeInput(data.secretKey) : '',
    role: data.role || 'user'
  };

  const errors = validateRegisterFields(sanitized);

  return {
    data: sanitized,
    errors,
    isValid: errors.length === 0
  };
};

/**
 * Obtener sugerencias de fortaleza de contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} Información sobre la fortaleza
 */
const getPasswordStrength = (password) => {
  if (!password) {
    return {
      strength: 'none',
      score: 0,
      suggestions: ['Ingresa una contraseña']
    };
  }

  let score = 0;
  const suggestions = [];

  // Longitud
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Usa al menos 8 caracteres');
  }

  // Minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluye letras minúsculas');
  }

  // Mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluye letras mayúsculas');
  }

  // Números
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluye números');
  }

  // Caracteres especiales
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluye caracteres especiales (!@#$%^&*)');
  }

  // Determinar fortaleza
  let strength;
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else strength = 'very_strong';

  return {
    strength,
    score,
    suggestions: suggestions.length > 0 ? suggestions : ['¡Contraseña segura!']
  };
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidPhone,
  isValidUsername,
  isValidName,
  validateRegisterFields,
  validateLoginFields,
  validateSecretKeyInput,
  sanitizeInput,
  validateAndSanitizeRegisterData,
  getPasswordStrength
};
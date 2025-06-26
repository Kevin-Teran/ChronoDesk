export const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(
    (field) => !data[field] || !data[field].toString().trim()
  );

  if (missing.length > 0) {
    throw new Error(`Los siguientes campos son requeridos: ${missing.join(', ')}`);
  }
};
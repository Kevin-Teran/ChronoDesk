export const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error.response?.data || error.message);

  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage;

  const customError = new Error(message);
  customError.response = error.response;
  throw customError;
};
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  export const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };
  
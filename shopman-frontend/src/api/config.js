const getBaseUrl = () => {
  // Use the correct environment variable
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Local development fallback
  return "http://127.0.0.1:8000";
};

export default getBaseUrl;

// src/api/config.js
const getBaseUrl = () => {
  // 1. Try CRA environment variable
  const envUrl = process.env.REACT_APP_API_BASE_URL;

  if (envUrl && envUrl.trim() !== "") {
    return envUrl; // <-- No import.meta at all
  }

  // 2. Default to local backend root
  return `${window.location.protocol}//localhost:8000`;
};

export default getBaseUrl;

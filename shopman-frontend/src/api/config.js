const getBaseUrl = () => {
  // 1️⃣ If environment variable exists → use it
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // 2️⃣ If running locally → use localhost
  if (window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }

  // 3️⃣ Production fallback → ALWAYS backend URL
  return "https://shopman-backend-2.onrender.com";
};

export default getBaseUrl;

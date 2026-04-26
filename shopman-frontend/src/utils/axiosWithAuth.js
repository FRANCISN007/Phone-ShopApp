import axios from "axios";

const axiosWithAuth = () => {
  const token = localStorage.getItem("token");
  const licenseKey = localStorage.getItem("license_key");

  const instance = axios.create({
    baseURL:
      process.env.REACT_APP_API_BASE_URL ||
      "https://shopman-backend-production.up.railway.app", // 🔥 production fallback

    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      ...(licenseKey ? { "X-License-Key": licenseKey } : {}),
    },
  });

  instance.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        return Promise.reject({
          message: "Network or backend not reachable (production)",
        });
      }

      return Promise.reject(
        error.response.data || { message: "API request failed" }
      );
    }
  );

  return instance;
};

export default axiosWithAuth;

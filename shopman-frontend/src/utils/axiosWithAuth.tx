import axios from "axios";

/**
 * 🔴 CRITICAL: Do NOT fallback to localhost in production
 */
const baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  throw new Error("❌ REACT_APP_API_BASE_URL is not set");
}

/**
 * Create axios instance
 */
const axiosWithAuth = axios.create({
  baseURL,
});

/**
 * REQUEST INTERCEPTOR
 */
axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const licenseKey = localStorage.getItem("license_key");

    // ✅ Attach token dynamically (important)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Attach license key if available
    if (licenseKey) {
      config.headers["X-License-Key"] = licenseKey;
    }

    /**
     * 🔥 IMPORTANT:
     * Only set Content-Type if NOT already set
     * This prevents breaking login (form-urlencoded)
     */
    if (!config.headers["Content-Type"]) {
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    /**
     * 🔴 Network error (backend unreachable / CORS / timeout)
     */
    if (!error.response) {
      return Promise.reject({
        message: "Network error: Unable to reach server",
      });
    }

    /**
     * 🔴 Unauthorized (optional handling)
     */
    if (error.response.status === 401) {
      // Optional: auto logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // window.location.href = "/login";
    }

    /**
     * Return backend error message cleanly
     */
    return Promise.reject(
      error.response.data || {
        message: "API request failed",
      }
    );
  }
);

export default axiosWithAuth;

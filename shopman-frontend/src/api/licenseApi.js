import axios from "axios";

// ----------------------
// Determine backend URL
// ----------------------
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
console.log("🔗 License API Base URL:", BASE_URL);

// ----------------------
// Create axios client
// ----------------------
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: only set JSON if body is not FormData
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; // FormData sets boundary automatically
  }
  return config;
});

// ----------------------
// Verify License Key
// ----------------------
export const verifyLicense = async (licenseKey) => {
  if (!licenseKey) throw new Error("License key is required.");
  try {
    const response = await apiClient.get(`/license/verify/${encodeURIComponent(licenseKey)}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        return { valid: false, message: error.response.data.detail || "Invalid license" };
      }
      console.error("❌ verifyLicense response error:", error.response.data);
      throw { valid: false, message: error.response.data.detail || "API request failed" };
    } else {
      console.error("❌ verifyLicense network error:", error);
      throw { valid: false, message: "Network error or backend not reachable" };
    }
  }
};

// ----------------------
// Generate License Key
// ----------------------
export const generateLicense = async (adminPassword, licenseKey) => {
  if (!adminPassword || !licenseKey) {
    throw new Error("Admin password and license key are required.");
  }

  try {
    const formData = new FormData();
    formData.append("license_password", adminPassword);
    formData.append("key", licenseKey);

    const response = await apiClient.post("/license/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("❌ generateLicense response error:", error.response.data);
      throw error.response.data || { message: "API request failed" };
    } else {
      console.error("❌ generateLicense network error:", error);
      throw { message: "Network error or backend not reachable" };
    }
  }
};

// ----------------------
// Check License Status
// ----------------------
export const checkLicenseStatus = async () => {
  try {
    const response = await apiClient.get("/license/check");
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("❌ checkLicenseStatus response error:", error.response.data);
      throw error.response.data || { message: "License check failed" };
    } else {
      console.error("❌ checkLicenseStatus network error:", error);
      throw { message: "Network error or backend not reachable" };
    }
  }
};

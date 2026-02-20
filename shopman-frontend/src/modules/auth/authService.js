import axios from "axios";

// ----------------------
// Determine backend URL
// ----------------------
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
console.log("🧪 Login API Base URL:", BASE_URL);

// ----------------------
// Create axios client
// ----------------------
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: handle form data headers
authClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData || config.data instanceof URLSearchParams) {
    delete config.headers["Content-Type"]; // Let browser set boundary for form data
  }
  return config;
});

// Response interceptor for unified error handling
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("❌ Network or backend not reachable", error);
      return Promise.reject({ message: "Network or backend not reachable" });
    }
    return Promise.reject(error.response.data || { message: "API request failed" });
  }
);

// ----------------------
// Login user
// ----------------------
export const loginUser = async (username, password) => {
  if (!username || !password) throw new Error("Username and password are required.");

  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await authClient.post("/users/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const user = response.data;

    // Save user info and token
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", user.access_token);

    return user;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

// ----------------------
// Register user
// ----------------------
export const registerUser = async ({ username, password, roles, admin_password }) => {
  if (!username || !password || !roles || !admin_password) {
    throw new Error("All registration fields are required.");
  }

  try {
    const response = await authClient.post("/users/register/", {
      username,
      password,
      roles,
      admin_password,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Registration failed:", error);
    throw error.response?.data || { message: "Registration failed" };
  }
};

// ----------------------
// Get current user
// ----------------------
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ----------------------
// Logout user
// ----------------------
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

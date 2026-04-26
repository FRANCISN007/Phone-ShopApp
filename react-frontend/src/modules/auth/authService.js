// src/api/authService.js
import axios from "axios";

// ================= BASE URL =================
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

console.log("🧪 API Base URL:", BASE_URL);

// ================= AXIOS INSTANCE =================
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
// Automatically attach token to every request
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= LOGIN =================
export const loginUser = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await authClient.post("/users/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const user = response.data;

    // ✅ Store token + user
    localStorage.setItem("token", user.access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

// ================= REGISTER =================
export const registerUser = async ({
  username,
  password,
  roles,
  admin_password,
}) => {
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



// ================= FETCH CURRENT USER (FROM BACKEND) =================
export const fetchCurrentUser = async () => {
  try {
    const response = await authClient.get("/users/me"); // ✅ matches your backend

    // Update stored user with fresh backend data
    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    console.error("❌ Fetch current user failed:", error);

    // If token is invalid → force logout
    if (error.response?.status === 401) {
      logoutUser();
    }

    throw error;
  }
};

// ================= LOCAL USER (FAST ACCESS) =================
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ================= LOGOUT =================
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// ================= AUTH CHECK =================
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};




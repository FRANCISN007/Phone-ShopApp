// src/api/authService.js
import axios from "axios";
import getBaseUrl from "./config";

// ✅ Resolve base URL once (no async mutation)
const BASE_URL = getBaseUrl();

console.log("🌐 Auth API Base URL:", BASE_URL);

// ✅ Create axios client
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// LOGIN
// ===============================
export const loginUser = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await authClient.post("/users/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const user = response.data;

    // ✅ Store session
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", user.access_token);

    return user;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

// ===============================
// REGISTER
// ===============================
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

// ===============================
// SESSION HELPERS
// ===============================
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

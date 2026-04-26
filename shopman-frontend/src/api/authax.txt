// src/api/authService.js
import axios from "axios";

/**
 * 🔴 CRITICAL: Use ONLY environment variable
 */
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("❌ REACT_APP_API_BASE_URL is not set");
}

console.log("✅ API BASE URL:", BASE_URL);

/**
 * ----------------------
 * Axios Client
 * ----------------------
 */
const authClient = axios.create({
  baseURL: BASE_URL,
});

/**
 * ----------------------
 * Login User (FORM DATA - REQUIRED)
 * ----------------------
 */
export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username); // STRICT
  formData.append("password", password);

  const response = await axios.post(
    `${BASE_URL}/users/token`,
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const user = response.data;

  // Save token & user
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.access_token);

  return user;
};

/**
 * ----------------------
 * Register User (JSON)
 * ----------------------
 */
export const registerUser = async ({
  username,
  password,
  roles,
  admin_password,
}) => {
  const response = await authClient.post("/users/register/", {
    username,
    password,
    roles,
    admin_password,
  });

  return response.data;
};

/**
 * ----------------------
 * Get Current User
 * ----------------------
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * ----------------------
 * Logout
 * ----------------------
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

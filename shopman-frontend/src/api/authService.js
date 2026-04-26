// src/api/authService.js
import axios from "axios";
import getBaseUrl from "./config";

// ----------------------
// BASE URL (dynamic safe version)
// ----------------------
const getWorkingBaseUrl = () => {
  return getBaseUrl() || "https://shopman-backend-production.up.railway.app";
};

// ----------------------
// Health Check (kept but optional use)
// ----------------------
const testBackend = async (url) => {
  try {
    const response = await fetch(`${url}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
};

// ----------------------
// Axios Client (DO NOT FREEZE BASE URL)
// ----------------------
const createAuthClient = () => {
  return axios.create({
    baseURL: getWorkingBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// ----------------------
// Login User
// ----------------------
export const loginUser = async (username, password) => {
  const authClient = createAuthClient(); // 🔥 recreated per call

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await authClient.post("/users/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const user = response.data;

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.access_token);

  return user;
};

// ----------------------
// Register User
// ----------------------
export const registerUser = async ({
  username,
  password,
  roles,
  admin_password,
}) => {
  const authClient = createAuthClient();

  const response = await authClient.post("/users/register/", {
    username,
    password,
    roles,
    admin_password,
  });

  return response.data;
};

// ----------------------
// Get Current User
// ----------------------
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ----------------------
// Logout
// ----------------------
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

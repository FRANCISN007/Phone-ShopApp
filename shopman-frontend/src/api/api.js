import axios from "axios";

// ✅ Always use React environment variable first
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

console.log("🌐 Global API Base URL:", API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;

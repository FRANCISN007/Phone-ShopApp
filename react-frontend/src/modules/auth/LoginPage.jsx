import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authService";
import "./LogReg.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // STRICT: do not change case
      const user = await loginUser(username.trim(), password);

      // Already stored in authService, but safe to repeat
      localStorage.setItem("token", user.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Extract exact backend message if available
      const backendMessage = err.response?.data?.detail;

      if (backendMessage) {
        setError(backendMessage); // ✅ Exact backend error
      } else if (err.request) {
        setError("Unable to reach server. Please check your connection.");
      } else {
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* LEFT SIDE DESCRIPTION */}
      <div className="auth-left-panel">
        <h1 className="app-title">SHopMan App</h1>
        <p className="app-description">
          The App is a complete Inventory management & Sales solution designed to
          simplify, automate, and centralize operations across:
        </p>
        <ul className="app-features">
          <li>POS Sales Point</li>
          <li>Purchases</li>
          <li>Payments & Receipts</li>
          <li>Secured Database Integration</li>
          <li>Stock & Inventory Control</li>
          <li>Profit & Loss Account</li>
        </ul>
        <p className="app-tagline">
          Fast • Reliable • All-in-One Inventory Management System
        </p>
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="auth-container">
        <div className="auth-logo-text">
          SHopMan <span>App</span>
        </div>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <footer className="homes-footer">
        <div>Produced & Licensed by School of Accounting Package</div>
        <div>© 2025</div>
      </footer>
    </div>
  );
};

export default LoginPage;

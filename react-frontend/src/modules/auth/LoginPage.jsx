import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authService";
import "./LogReg.css";
import { Link } from "react-router-dom";
import { getLicenseExpiryWarning } from "../../utils/licenseUtils";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const warning = getLicenseExpiryWarning();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginUser(username.trim().toLowerCase(), password);
      localStorage.setItem("token", user.access_token);

      navigate("/dashboard");

    } catch (err) {
      setError(err?.message || "Invalid username or password.");
    }
  };

  return (
    <div className="auth-page-wrapper">

      {/* ⭐ LEFT SIDE DESCRIPTION */}
      <div className="auth-left-panel">
        <h1 className="app-title">
          SHopMan APP
        </h1>

        <p className="app-description">
          The App is a complete Inventory management & Sales solution designed to
          simplify, automate, and centralize operations across:
        </p>

        <ul className="app-features">
          <li>Sales </li>
          <li>Purchases</li>
          <li>Payments & Receipts</li>
          <li>Secured Database Integration</li>
          <li>Stock & Inventory Control</li>
          <li>Profit & Loss Account</li>
        </ul>

        <p className="app-tagline">
          Fast • Reliable • All-in-One Invenyroty Management System
        </p>
      </div>

      {/* ⭐ RIGHT SIDE LOGIN FORM */}
      <div className="auth-container">

        {warning && (
          <div className="license-warning">
            {warning}
          </div>
        )}

        <div className="auth-logo-text">
          SHopMan <span></span> App <span></span>
        </div>

        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Login</button>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
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

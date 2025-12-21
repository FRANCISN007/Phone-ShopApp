import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LicensePage from "./modules/license/LicensePage";
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";

import PosSales from "./components/pos/PosSales";




console.log("✅ API BASE:", process.env.REACT_APP_API_BASE_URL);

const App = () => {
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);

  useEffect(() => {
    const licenseVerified = localStorage.getItem("license_verified") === "true";
    setIsLicenseVerified(licenseVerified);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/license" element={<LicensePage setIsLicenseVerified={setIsLicenseVerified} />} />
        <Route
          path="/login"
          element={isLicenseVerified ? <LoginPage /> : <Navigate to="/license" replace />}
        />
        <Route
          path="/register"
          element={isLicenseVerified ? <RegisterPage /> : <Navigate to="/license" replace />}
        />

        {/* Protected Dashboard routes */}
        <Route path="/dashboard/*" element={isLicenseVerified ? <DashboardPage /> : <Navigate to="/license" replace />} >
          <Route path="users" element={<UsersPage />} />
          <Route path="pos" element={<PosSales />} />
        </Route>


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

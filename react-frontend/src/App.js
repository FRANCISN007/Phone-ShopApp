import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RequireLicense from "./components/guards/RequireLicense";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";

// Auth / License
import LicensePage from "./modules/license/LicensePage";
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";

// POS
import PosSales from "./components/pos/PosSales";

console.log("✅ API BASE:", process.env.REACT_APP_API_BASE_URL);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/license" element={<LicensePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= LICENSE-PROTECTED ROUTES ================= */}
        <Route element={<RequireLicense />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="pos" element={<PosSales />} />
            {/* add more dashboard routes here */}
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

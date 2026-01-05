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

// Sales
import ListSales from "./components/sales/ListSales";
import SalesItemSold from "./components/sales/SalesItemSold";
import SalesAnalysis from "./components/sales/SalesAnalysis";
import StaffSalesReport from "./components/sales/StaffSalesReport";
import DebtorSalesReport from "./components/sales/DebtorSalesReport";
import SalesByCustomer from "./components/sales/SalesByCustomer";
import AddPayment from "./components/sales/AddPayment";
import ListSalesPayment from "./components/sales/ListSalesPayment";
import PriceUpdate from "./components/sales/PriceUpdate";


// Stock
import CreateProduct from "./components/stock/CreateProduct";
import ListProduct from "./components/stock/ListProduct";

import ImportProduct from "./components/stock/ImportProduct";
import ListInventory from "./components/stock/ListInventory";
import StockAdjustment from "./components/stock/StockAdjustment";
import ListAdjustment from "./components/stock/ListAdjustment";



// Purchase
import CreatePurchase from "./components/purchase/CreatePurchase";



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
            
            {/* Dashboard Pages */}
            <Route path="users" element={<UsersPage />} />
            <Route path="pos" element={<PosSales />} />

            {/* ✅ SALES ROUTES */}
            <Route path="sales">
              <Route path="list" element={<ListSales />} />
              <Route path="itemsold" element={<SalesItemSold />} />
              <Route path="analysis" element={<SalesAnalysis />} />
              <Route path="staff" element={<StaffSalesReport />} />
              <Route path="debtor" element={<DebtorSalesReport />} />
              <Route path="customer" element={<SalesByCustomer />} />
              <Route path="addpayment" element={<AddPayment />} />
              <Route path="listpayment" element={<ListSalesPayment />} />
              <Route path="priceupdate" element={<PriceUpdate />} />

            </Route>

            {/* ✅ STOCK ROUTES */}
            <Route path="stock">
              <Route path="create" element={<CreateProduct />} />
              <Route path="list" element={<ListProduct />} />
              <Route path="import" element={<ImportProduct />} />
              <Route path="inventory" element={<ListInventory />} />
              <Route path="adjustment" element={<StockAdjustment />} />
              <Route path="adjustmentlist" element={<ListAdjustment />} />

            </Route>

            {/* ✅ STOCK ROUTES */}
            <Route path="purchase">
              <Route path="create" element={<CreatePurchase />} />
              

            </Route>


           

            

          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

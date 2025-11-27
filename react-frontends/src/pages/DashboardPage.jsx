import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import HotelPhoto3 from "../assets/images/HotelPhoto3.png";
import "./DashboardPage.css";
import { FaFileExcel, FaPrint } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `http://${window.location.hostname}:8000`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = "admin"; // Ideally fetch dynamically from logged-in user

  const [isBookingsHovered, setBookingsHovered] = useState(false);
  const [isPaymentsHovered, setPaymentsHovered] = useState(false);
  const [isEventsHovered, setEventsHovered] = useState(false);

  // ✅ Check dashboard alerts and auto-update rooms
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkDashboardStatus = async () => {
      try {
        await axios.get(`${API_BASE_URL}/bookings/reservations/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        await axios.post(
          `${API_BASE_URL}/rooms/update_status_after_checkout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Dashboard check failed:", err.message);
      }
    };

    checkDashboardStatus();
    const intervalId = setInterval(checkDashboardStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const menu = [
    { name: "🙎 Users", path: "/dashboard/users", adminOnly: true },
    { name: "🏨 Sales", path: "/dashboard/rooms" },
    { name: "📅 Purchase", path: "/dashboard/bookings" },
    { name: "💳 Payments", path: "/dashboard/payments" },
    { name: "🎉 Inventory", path: "/dashboard/events" },
    { name: "🏪 Store", path: "/store" },
  ];

  const bookingSubmenu = [
    { label: "➕ Create Sales", path: "/dashboard/bookings/create" },
    { label: "📝 List Sales", path: "/dashboard/bookings/list" },
  ];

  const paymentSubmenu = [
    { label: "➕ Create Payment", path: "/dashboard/payments/create" },
    { label: "📝 List Payment", path: "/dashboard/payments/list" },
    { label: "❌ Void payment", path: "/dashboard/payments/void" },
  ];

  const eventSubmenu = [
    { label: "➕ Create Event", path: "/dashboard/events/create" },
    { label: "📝 List Event", path: "/dashboard/events/list" },
    { label: "💳 Make Payment", path: "/dashboard/events/payment" },
    { label: "📄 List Payment", path: "/dashboard/events/payments/list" },
    { label: "❌ Void Payment", path: "/dashboard/events/payments/void" },
  ];

  const handleBackupClick = async () => {
    if (!window.confirm("Are you sure you want to back up the database?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/backup/db`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Backup failed");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || "backup.sql";

      saveAs(blob, filename);
      alert(`✅ Backup downloaded: ${filename}`);
    } catch (error) {
      alert(`❌ Backup failed: ${error.message}`);
    }
  };

  const exportToExcel = async () => {
    const table = document.querySelector(".content-area table");
    if (!table) return alert("No table found to export.");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("DashboardData");

    const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.innerText.trim());
    sheet.addRow(headers).font = { bold: true };

    Array.from(table.querySelectorAll("tbody tr")).forEach((tr) => {
      const row = Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "dashboard_data.xlsx");
  };

  const printContent = () => {
    const content = document.querySelector(".content-area");
    if (!content) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print</title></head><body>");
    printWindow.document.write(content.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">MENU</h2>
        <nav>
          {menu.map((item) =>
            (!item.adminOnly || userRole === "admin") && (
              <div key={item.path} className="sidebar-item-wrapper">
                <button onClick={() => navigate(item.path)} className="sidebar-button">
                  {item.name}
                </button>
              </div>
            )
          )}
          <button onClick={handleBackupClick} className="sidebar-button">
            💾 Backup
          </button>
        </nav>
      </aside>

      <button onClick={() => navigate("/logout")} className="logout-button">
        🚪 Logout
      </button>

      <main className="main-content">
        <header className="header">
          <h1 className="header-title">🏠 Dashboard</h1>
          <div>
            <button onClick={exportToExcel} className="action-button">
              <FaFileExcel /> Export to Excel
            </button>
            <button onClick={printContent} className="action-button">
              <FaPrint /> Print
            </button>
          </div>
        </header>

        <section
          className="content-area"
          style={{
            backgroundImage: location.pathname === "/dashboard" ? `url(${HotelPhoto3})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100%",
          }}
        >
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

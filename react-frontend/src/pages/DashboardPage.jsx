import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSubMenu, setActiveSubMenu] = useState(null); 
  

  /* ===============================
     MAIN MENU
  ================================ */
  const mainMenu = useMemo(
    () => [
      { label: "POS", icon: "🛒", path: "/dashboard/pos" },
      { label: "Sales", icon: "💰", submenu: true },
      { label: "Stock", icon: "📦", path: "/dashboard/stock" },
      { label: "Purchase", icon: "🧾", path: "/dashboard/purchase" },
      { label: "Accounts", icon: "🧮", path: "/dashboard/accounts" },
      { label: "Reports", icon: "📊", path: "/dashboard/reports" },
      { label: "Maintenance", icon: "🛠", path: "/dashboard/maintenance" },
      { label: "Export", icon: "📤", action: "export" },
      { label: "Print", icon: "🖨️", action: "print" },
      { label: "Exit", icon: "⎋", path: "/exit", danger: true },
    ],
    []
  );

  /* ===============================
     SALES SUBMENU
  ================================ */
const salesSubMenu = [
  { label: "List Sales", action: "listSales", icon: "📄" },
  { label: "List Item Sold", action: "itemsold", icon: "🧾" },
  { label: "Update Sales", action: "updateSales", icon: "✏️" },
  { label: "Update Sales Quantity", action: "updateSalesQty", icon: "✏️" },
  { label: "Delete Sales", action: "deleteSales", icon: "❌" },

  // 📊 Reports
  { label: "Sales Analysis", action: "salesAnalysis", icon: "📊" },
  { label: "Staff Sales Report", action: "staffSalesReport", icon: "👨‍💼" },
  { label: "Outstanding Sales", action: "outstandingSales", icon: "⚠️" },

  // 👤 Customer
  { label: "Sales by Customer", action: "salesByCustomer", icon: "👤" },
];

  /* ===============================
     EXPORT TO EXCEL
  ================================ */
  const exportToExcel = useCallback(async () => {
    const table = document.querySelector(".content-area table");
    if (!table) return alert("No table found to export.");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data");

    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.innerText.trim()
    );
    sheet.addRow(headers).font = { bold: true };

    Array.from(table.querySelectorAll("tbody tr")).forEach((tr) => {
      const row = Array.from(tr.querySelectorAll("td")).map((td) =>
        td.innerText.trim()
      );
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "export.xlsx"
    );
  }, []);

  /* ===============================
     PRINT CONTENT
  ================================ */
  const printContent = useCallback(() => {
    const content = document.querySelector(".content-area");
    if (!content) return;

    const win = window.open("", "_blank");
    win.document.write("<html><head><title>Print</title></head><body>");
    win.document.write(content.innerHTML);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  }, []);

  /* ===============================
     MENU ACTION HANDLER
  ================================ */
  const handleMenuAction = useCallback(
    (item) => {
      if (item.action === "export") return exportToExcel();
      if (item.action === "print") return printContent();

      if (item.label === "POS") {
        window.open(
          `${window.location.origin}/dashboard/pos`,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      if (item.submenu) {
        setActiveSubMenu(activeSubMenu === item.label ? null : item.label);
        return;
      }


      if (item.path) {
        setActiveSubMenu(null);
        navigate(item.path);
      }
    },
    [navigate, exportToExcel, printContent, activeSubMenu]
  );

  /* ===============================
     SALES SUBMENU ACTIONS
  ================================ */
  const handleSalesAction = (action) => {
    
    switch (action) {
      case "listSales":
        navigate("/dashboard/sales/list");
        break;
      case "itemsold":
        navigate("/dashboard/sales/itemsold");
        break;
      case "updateSales":
        navigate("/dashboard/sales/update");
        break;
      case "deleteSales":
        navigate("/dashboard/sales/delete");
        break;
      case "salesAnalysis":
        navigate("/dashboard/sales/analysis");
        break;
      case "salesByCustomer":
        navigate("/dashboard/sales/customer");
        break;
      default:
        break;
    }
    setActiveSubMenu(null);
  };

  /* ===============================
     KEYBOARD NAVIGATION
  ================================ */
  useEffect(() => {
    const cols = 6;
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
        return;

      if (location.pathname.startsWith("/dashboard/pos")) return;

      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % mainMenu.length);
      else if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i === 0 ? mainMenu.length - 1 : i - 1));
      else if (e.key === "ArrowDown")
        setActiveIndex((i) => Math.min(i + cols, mainMenu.length - 1));
      else if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - cols, 0));
      else if (e.key === "Enter") handleMenuAction(mainMenu[activeIndex]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, mainMenu, handleMenuAction, location.pathname]);

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="dashboard-container">
      {/* 🔹 TOP POS MENU */}
      <div className="top-menu">
        {mainMenu.map((item, index) => (
          <div
            key={item.label}
            className={`menu-card ${index === activeIndex ? "active" : ""} ${
              item.danger ? "danger" : ""
            }`}
            onClick={() => handleMenuAction(item)}
          >
            <div className={`menu-icon ${item.label === "Exit" ? "exit-icon" : ""}`}>
              {item.icon}
            </div>
            <div className="menu-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 MAIN CONTENT */}
      <main className="main-content">
        <section className="content-area">
          {activeSubMenu === "Sales" ? (
            <div className="submenu-frame center-frame">
              {/* Header */}
              <div className="submenu-header">
                <h2 className="submenu-heading">Sales Menu</h2>
                <button
                  className="close-btn"
                  onClick={() => setActiveSubMenu(null)}
                >
                  ✖
                </button>
              </div>

              {/* Cards */}
              <div className="sales-submenu grid-3x2">
                {salesSubMenu.map((sub, idx) => (
                  <div
                    key={sub.label}
                    className={`submenu-card card-${idx + 1}`}
                    onClick={() => handleSalesAction(sub.action)}
                  >
                    <div className="submenu-icon">{sub.icon}</div>
                    <div className="submenu-label">{sub.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </section>

      </main>
    </div>
  );
};

export default DashboardPage;

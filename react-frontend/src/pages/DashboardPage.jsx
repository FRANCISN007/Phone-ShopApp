import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ===============================
     ACTIVE MENU (KEYBOARD)
  ================================ */
  const [activeIndex, setActiveIndex] = useState(0);


  

  /* ===============================
     MAIN POS MENU (MEMOIZED)
  ================================ */
  const mainMenu = useMemo(
    () => [
      { label: "POS", icon: "🛒", path: "/dashboard/pos" },
      { label: "Sales", icon: "💰", path: "/dashboard/sales" },
      { label: "Stock", icon: "📦", path: "/dashboard/stock" },
      { label: "Purchase", icon: "🧾", path: "/dashboard/purchase" },
      { label: "Accounts", icon: "🧮", path: "/dashboard/accounts" },
      { label: "Reports", icon: "📊", path: "/dashboard/reports" },
      { label: "Maintenance", icon: "🛠", path: "/dashboard/maintenance" },
      { label: "Export", icon: "📤", action: "export" },
      { label: "Print", icon: "🖨️", action: "print" },
      {
        label: "Exit",icon: "⎋",path: "/exit",danger: true,
      },
    ],
    []
  );

  /* ===============================
     EXPORT TO EXCEL
  ================================ */
  const exportToExcel = useCallback(async () => {
    const table = document.querySelector(".content-area table");
    if (!table) {
      alert("No table found to export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data");

    const headers = Array.from(
      table.querySelectorAll("thead th")
    ).map((th) => th.innerText.trim());

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

      // ✅ MULTI-POS: open ONLY in new tab
      if (item.label === "POS") {
        window.open(
          `${window.location.origin}/dashboard/pos`,
          "_blank",
          "noopener,noreferrer"
        );
        return; // 🔥 THIS LINE WAS MISSING
      }

      if (item.path) navigate(item.path);
    },
    [navigate, exportToExcel, printContent]
  );


  /* ===============================
     KEYBOARD NAVIGATION
  ================================ */

  
  useEffect(() => {
    const cols = 6;

    const handleKeyDown = (e) => {
      // ❌ Ignore when typing
      const tag = e.target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // ❌ Ignore inside POS
      if (location.pathname.startsWith("/dashboard/pos")) {
        return;
      }

      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % mainMenu.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((i) =>
          i === 0 ? mainMenu.length - 1 : i - 1
        );
      } else if (e.key === "ArrowDown") {
        setActiveIndex((i) =>
          Math.min(i + cols, mainMenu.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        setActiveIndex((i) => Math.max(i - cols, 0));
      } else if (e.key === "Enter") {
        handleMenuAction(mainMenu[activeIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeIndex,
    mainMenu,
    handleMenuAction,
    location.pathname, // ✅ FIX
  ]);


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
            className={`menu-card ${
              index === activeIndex ? "active" : ""
            } ${item.danger ? "danger" : ""}`}
            onClick={() => handleMenuAction(item)}
          >
            <div
              className={`menu-icon ${
                item.label === "Exit" ? "exit-icon" : ""
              }`}
            >
              {item.icon}
            </div>
            <div className="menu-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 MAIN CONTENT */}
      <main className="main-content">
        <section
          className="content-area"
          style={{
            backgroundImage:
              location.pathname === "/dashboard"
                
                
            
            
          }}
        >
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

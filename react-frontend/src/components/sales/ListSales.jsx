import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListSales.css";

const ListSales = () => {
  const today = new Date().toISOString().split("T")[0];

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ total_sales: 0, total_paid: 0, total_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const axiosInstance = axiosWithAuth();

      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axiosInstance.get("/sales/", { params });
      console.log("🔥 SALES RESPONSE:", response.data);

      if (response.data && Array.isArray(response.data.sales)) {
        setSales(response.data.sales);
        setSummary(response.data.summary || { total_sales: 0, total_paid: 0, total_balance: 0 });
      } else {
        console.error("❌ Unexpected sales response:", response.data);
        setSales([]);
        setSummary({ total_sales: 0, total_paid: 0, total_balance: 0 });
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("❌ Failed to load sales:", err);

      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("You do not have permission to view sales.");
      else setError("Failed to load sales records.");

      setSales([]);
      setSummary({ total_sales: 0, total_paid: 0, total_balance: 0 });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Helper to format numbers with commas
  const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-US");

  return (
    <div className="list-sales-container">
      <h2 className="list-sales-title">📄 Sales Records</h2>

      {/* Date Filters */}
      <div className="sales-filters">
        <label>
          Start Date:{" "}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:{" "}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchSales}>Filter</button>
      </div>

      {loading && <p className="status-text">Loading sales...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Total Paid</th>
                <th>Balance Due</th>
                <th>Payment Status</th>
                <th>Sold At</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No sales records found
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => (
                  <tr key={sale.id ?? index}>
                    <td>{index + 1}</td>
                    <td>{sale.invoice_no ?? "-"}</td>
                    <td>{sale.customer_name || "Walk-in"}</td>
                    <td>{formatAmount(sale.total_amount)}</td>
                    <td>{formatAmount(sale.total_paid)}</td>
                    <td>{formatAmount(sale.balance_due)}</td>
                    <td>{sale.payment_status || "-"}</td>
                    <td>{sale.sold_at ? new Date(sale.sold_at).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Summary */}
          {sales.length > 0 && (
            <div className="sales-summary">
              <p>Total Sales: {formatAmount(summary.total_sales)}</p>
              <p>Total Paid: {formatAmount(summary.total_paid)}</p>
              <p>Total Balance: {formatAmount(summary.total_balance)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListSales;

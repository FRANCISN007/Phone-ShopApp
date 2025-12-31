import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./SalesAnalysis.css";

// Move BASE_URL outside the component to avoid useCallback warning
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const SalesAnalysis = () => {
  const todayStr = new Date().toISOString().split("T")[0]; // today as YYYY-MM-DD

  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState(todayStr); // default today
  const [endDate, setEndDate] = useState(todayStr);     // default today
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format numbers with comma separator
  const formatAmount = (value) => {
    if (value === "-" || value === null || value === undefined) return "-";
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Fetch sales analysis
  const fetchSalesAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { start_date: startDate, end_date: endDate };

      const res = await axios.get(`${BASE_URL}/sales/report/analysis`, {
        params,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const { items = [], total_sales = 0, total_margin = 0 } = res.data || {};

      // Append totals row
      const itemsWithTotals = [
        ...items,
        {
          product_id: "total",
          product_name: "TOTAL",
          quantity_sold: items.reduce((acc, i) => acc + i.quantity_sold, 0),
          cost_price: "-",
          selling_price: "-",
          total_sales: total_sales,
          margin: total_margin,
        },
      ];

      setSalesData(itemsWithTotals);
    } catch (err) {
      console.error("Failed to fetch sales analysis:", err);
      setError("Failed to fetch sales analysis");
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]); // ✅ No warning now, BASE_URL is static

  // Fetch on mount and whenever dates change
  useEffect(() => {
    fetchSalesAnalysis();
  }, [fetchSalesAnalysis]);

  return (
    <div className="sales-analysis-container">
      <h2>Sales Analysis</h2>

      <div className="filter-section">
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={fetchSalesAnalysis}>Filter</button>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="sales-analysis-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Cost Price</th>
                <th>Avg Selling Price</th>
                <th>Total Sales</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={6}>No data available</td>
                </tr>
              ) : (
                salesData.map((item, index) => (
                  <tr
                    key={item.product_id}
                    className={
                      item.product_id === "total"
                        ? "sales-total-row"
                        : index % 2 === 0
                        ? "even"
                        : "odd"
                    }
                  >
                    <td>{item.product_name}</td>
                    <td>{item.quantity_sold}</td>
                    <td>{formatAmount(item.cost_price)}</td>
                    <td>{formatAmount(item.selling_price)}</td>
                    <td>{formatAmount(item.total_sales)}</td>
                    <td>{formatAmount(item.margin)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesAnalysis;

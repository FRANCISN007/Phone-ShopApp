import React, { useEffect, useState, useCallback } from "react";

import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ProfitLoss.css";

const ProfitLoss = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(
    today.toISOString().split("T")[0]
  );

  /* =========================
     FETCH PROFIT & LOSS
  ========================= */
  const fetchProfitLoss = useCallback(async () => {
    try {
        setLoading(true);
        const res = await axiosWithAuth().get("/accounts/profit_loss/", {
        params: {
            start_date: startDate,
            end_date: endDate,
        },
        });
        setReport(res.data);
        setError("");
    } catch (err) {
        setError(
        err.response?.data?.detail || "Failed to load Profit & Loss report"
        );
    } finally {
        setLoading(false);
    }
    }, [startDate, endDate]);

  useEffect(() => {
    fetchProfitLoss();
  }, [fetchProfitLoss]);


  const formatAmount = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="profit-loss-container">
      <h2 className="profit-loss-title">Profit & Loss Statement</h2>

      {/* ================= FILTER ================= */}
      <div className="pl-filters">
        <label>
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={fetchProfitLoss}>Generate</button>
      </div>

      {loading && <p className="status-text">Loading report...</p>}
      {error && <p className="error-text">{error}</p>}

      {report && (
        <div className="table-wrapper">
          <table className="pl-table">
            <thead>
                <tr className="pl-head">
                <th>Description</th>
                <th className="amount">Amount</th>
                </tr>
            </thead>

            <tbody>

              {/* ================= REVENUE ================= */}
              <tr className="section-header">
                <td colSpan="2">Revenue</td>
              </tr>

              {Object.keys(report.revenue).length === 0 ? (
                <tr>
                  <td>No revenue</td>
                  <td className="amount">0.00</td>
                </tr>
              ) : (
                Object.entries(report.revenue).map(([category, amount]) => (
                  <tr key={category}>
                    <td className="indent">{category}</td>
                    <td className="amount">
                      {formatAmount(amount)}
                    </td>
                  </tr>
                ))
              )}

              <tr className="total-row">
                <td>Total Revenue</td>
                <td className="amount">
                  {formatAmount(report.total_revenue)}
                </td>
              </tr>

              {/* ================= COST OF SALES ================= */}
              <tr className="section-header">
                <td colSpan="2">Cost of Sales</td>
              </tr>

              <tr>
                <td className="indent">Cost of Sales</td>
                <td className="amount">
                  ({formatAmount(report.cost_of_sales)})
                </td>
              </tr>

              {/* ================= GROSS PROFIT ================= */}
              <tr className="highlight-row">
                <td>Gross Profit</td>
                <td className="amount">
                  {formatAmount(report.gross_profit)}
                </td>
              </tr>

              {/* ================= EXPENSES ================= */}
              <tr className="section-header">
                <td colSpan="2">Expenses</td>
              </tr>

              {Object.keys(report.expenses).length === 0 ? (
                <tr>
                  <td className="indent">No expenses</td>
                  <td className="amount">0.00</td>
                </tr>
              ) : (
                Object.entries(report.expenses).map(([type, amount]) => (
                  <tr key={type}>
                    <td className="indent">{type}</td>
                    <td className="amount">
                      ({formatAmount(amount)})
                    </td>
                  </tr>
                ))
              )}

              <tr className="total-row">
                <td>Total Expenses</td>
                <td className="amount">
                  ({formatAmount(report.total_expenses)})
                </td>
              </tr>

              {/* ================= NET PROFIT ================= */}
              <tr className="net-profit-row">
                <td>Net Profit</td>
                <td className="amount">
                  {formatAmount(report.net_profit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;

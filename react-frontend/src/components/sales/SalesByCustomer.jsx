import React, { useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./SalesByCustomer.css";

const SalesByCustomer = () => {
  const today = new Date().toISOString().split("T")[0];

  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [sales, setSales] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchSales = useCallback(async () => {
    // 🔴 HARD restriction (same as backend)
    if (!customerName.trim()) {
      setError("Please enter a customer name");
      setSales([]);
      setGrandTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await axiosWithAuth().get("/sales/by-customer", {
        params: {
          customer_name: customerName.trim(),
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });

      const data = res.data || [];
      setSales(data);

      // ✅ GRAND TOTAL (matches backend totals)
      const total = data.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      );
      setGrandTotal(total);

    } catch (err) {
      console.error("Sales by customer error:", err.response || err);
      setError("Failed to load sales");
      setSales([]);
      setGrandTotal(0);
    } finally {
      setLoading(false);
    }
  }, [customerName, startDate, endDate]);

  const money = (v) =>
    Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatDate = (dt) => {
    if (!dt) return "-";
    return dt.substring(0, 10);
  };

  return (
    <div className="sales-by-customer-container">
      <h2 className="sales-title">Sales By Customer</h2>

      {/* Filters */}
      <div className="sales-filters">
        <div className="filter-group">
          <label>Customer Name *</label>
          <input
            type="text"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button className="filter-btn" onClick={fetchSales}>
          Search
        </button>
      </div>

      {/* Status */}
      {loading && <div className="status-text">Loading...</div>}
      {error && <div className="error-text">{error}</div>}

      {/* Table */}
      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Invoice Total</th>
            </tr>
          </thead>

          <tbody>
            {searched && sales.length === 0 && !loading && (
              <tr>
                <td colSpan="8" className="empty-row">
                  No sales found for this customer
                </td>
              </tr>
            )}

            {sales.map((sale, index) => (
              <React.Fragment key={`sale-${sale.id}`}>
                {sale.items.map((item, itemIndex) => (
                  <tr key={`${sale.id}-${item.id}`}>
                    <td>{index + 1}</td>
                    <td>{sale.invoice_no}</td>
                    <td>{formatDate(sale.invoice_date)}</td>
                    <td>
                      <strong>{sale.customer_name || "Walk-in"}</strong>
                      <div className="sub-text">
                        {sale.customer_phone || "-"}
                      </div>
                    </td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.selling_price)}</td>

                    {itemIndex === 0 && (
                      <td rowSpan={sale.items.length}>
                        {money(sale.total_amount)}
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* ✅ GRAND TOTAL */}
            {sales.length > 0 && (
              <tr className="sales-total-row">
                <td colSpan="7">GRAND TOTAL</td>
                <td>{money(grandTotal)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesByCustomer;

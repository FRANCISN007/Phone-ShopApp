import React, { useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./SalesItemSold.css";

const SalesItemSold = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Number formatter (23,000.00)
  const formatAmount = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fetchItemsSold = async () => {
    if (!startDate || !endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const axiosInstance = axiosWithAuth();

      const response = await axiosInstance.get("/sales/item-sold", {
        params: {
          start_date: startDate,
          end_date: endDate,
          invoice_no: invoiceNo || undefined,
        },
      });

      // ✅ Flatten Sale → Items
      const flattenedItems = response.data.flatMap((sale) =>
        sale.items.map((item) => ({
          invoice_no: sale.invoice_no,
          invoice_date: sale.invoice_date,
          customer_name: sale.customer_name,
          product_id: item.product_id,
          product_name: item.product_name || "-", // ✅ Include product_name
          quantity: item.quantity,
          selling_price: item.selling_price,
          total_amount: item.total_amount,
        }))
      );

      setItems(flattenedItems);
    } catch (err) {
      console.error("❌ Failed to load items sold:", err);
      setError("Failed to load items sold");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-item-sold-container">
      <h2 className="sales-item-title">📦 Items Sold</h2>

      {/* ================= Filters ================= */}
      <div className="sales-item-filters">
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

        <label>
          Invoice No (optional)
          <input
            type="number"
            placeholder="Invoice No"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </label>

        <button onClick={fetchItemsSold}>Search</button>
      </div>

      {/* ================= Status ================= */}
      {loading && <p className="status-text">Loading items sold...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {/* ================= Table ================= */}
      {!loading && !error && (
        <div className="sales-item-table-wrapper">
          <table className="sales-item-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Selling Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                  >
                    <td>{item.invoice_no}</td>
                    <td>{item.invoice_date?.slice(0, 10)}</td>
                    <td>{item.customer_name || "-"}</td>
                    <td>{item.product_name || "-"}</td>
                    <td>{item.quantity}</td>
                    <td>{formatAmount(item.selling_price)}</td>
                    <td>{formatAmount(item.total_amount)}</td>
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

export default SalesItemSold;

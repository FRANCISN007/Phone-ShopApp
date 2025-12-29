import React, { useState, useMemo, useEffect, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./SalesItemSold.css";

const SalesItemSold = () => {
  // ✅ Default dates = today
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= FORMAT =================
  const formatAmount = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // ================= FETCH =================
  const fetchItemsSold = useCallback(async () => {
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

      // ✅ Flatten Sale → Items (include phone & ref from SALE)
      const flattenedItems =
        response.data?.sales?.flatMap((sale) =>
          sale.items.map((item) => ({
            invoice_no: sale.invoice_no,
            invoice_date: sale.invoice_date,
            customer_name: sale.customer_name || "-",
            customer_phone: sale.customer_phone || "-",
            ref_no: sale.ref_no || "-",
            product_name: item.product_name || "-",
            quantity: item.quantity,
            selling_price: item.selling_price,
            total_amount: item.total_amount,
          }))
        ) || [];

      setItems(flattenedItems);
    } catch (err) {
      console.error("❌ Failed to load items sold:", err);
      setError("Failed to load items sold");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, invoiceNo]);

  // ✅ Auto-load today
  useEffect(() => {
    fetchItemsSold();
  }, [fetchItemsSold]);

  // ================= TOTALS =================
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalQty += Number(item.quantity || 0);
        acc.totalAmount += Number(item.total_amount || 0);
        return acc;
      },
      { totalQty: 0, totalAmount: 0 }
    );
  }, [items]);

  return (
    <div className="sales-item-sold-container">
      <h2 className="sales-item-title">📦 Items Sold</h2>

      {/* ================= FILTERS ================= */}
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

      {/* ================= STATUS ================= */}
      {loading && <p className="status-text">Loading items sold...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {/* ================= TABLE ================= */}
      {!loading && !error && (
        <div className="sales-item-table-wrapper">
          <table className="sales-item-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone No</th>
                <th>Reference No</th>
                <th>Product</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Selling Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-row">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.invoice_no}</td>
                    <td>{item.invoice_date?.slice(0, 10)}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.customer_phone}</td>
                    <td>{item.ref_no}</td>
                    <td>{item.product_name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">
                      {formatAmount(item.selling_price)}
                    </td>
                    <td className="text-right">
                      {formatAmount(item.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* ================= TOTALS ================= */}
            {items.length > 0 && (
              <tfoot>
                <tr className="total-row">
                  <td colSpan="6">TOTAL</td>
                  <td className="text-right">{totals.totalQty}</td>
                  <td></td>
                  <td className="text-right">
                    {formatAmount(totals.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesItemSold;

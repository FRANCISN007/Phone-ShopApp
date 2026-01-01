import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./OutstandingSales.css";

const OutstandingSales = () => {
  // Default to today in local timezone
  const today = new Date();
  const localToday = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

  const [startDate, setStartDate] = useState(localToday);
  const [endDate, setEndDate] = useState(localToday);
  const [customerName, setCustomerName] = useState("");

  const [show, setShow] = useState(true); // NEW: controls visibility

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    sales_sum: 0,
    paid_sum: 0,
    balance_sum: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch outstanding sales
    const fetchOutstandingSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add one day to endDate for full coverage
      const endDateAdjusted = endDate
        ? new Date(endDate)
        : new Date();

      endDateAdjusted.setHours(23, 59, 59, 999); // end of day

      const res = await axiosWithAuth().get("/sales/outstanding", {
        params: {
          start_date: startDate || undefined, // YYYY-MM-DD
          end_date: endDate || undefined,     // YYYY-MM-DD
          customer_name: customerName || undefined,
        },
      });

    setSales(res.data?.sales ?? []);
    setSummary(res.data?.summary ?? {});
  } catch (err) {
    console.error("Outstanding sales fetch error:", err.response || err);
    setError("Failed to load outstanding sales");
  } finally {
    setLoading(false);
  }
}, [startDate, endDate, customerName]);


  // Fetch sales for today on mount
  useEffect(() => {
    fetchOutstandingSales();
  }, [fetchOutstandingSales]);

  const money = (v) =>
    Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatDate = (dtString) => {
    if (!dtString) return "-";
    return dtString.substring(0, 10); // "YYYY-MM-DD"
  };

  if (!show) return null; // hide the component when closed

  return (
    <div className="outstanding-sales-container">
      {/* Close button */}
      <button
        className="close-btn"
        onClick={() => setShow(false)} // hides the page
      >
        ✖
      </button>
      
      <h2 className="outstanding-sales-title">Outstanding Sales Report</h2>

      {/* Filters */}
      <div className="outstanding-sales-filters">
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

        <div className="filter-group">
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Search customer..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <button className="filter-btn" onClick={fetchOutstandingSales}>
          Filter
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
              <th>Total Paid</th>
              <th>Balance Due</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && !loading && (
              <tr>
                <td colSpan="10" className="empty-row">
                  No outstanding sales found
                </td>
              </tr>
            )}

            {sales.map((sale, index) => (
              <React.Fragment key={`invoice-${sale.invoice_no}-${sale.id}`}>
                {sale.items.map((item, itemIndex) => (
                  <tr key={`${sale.id}-${item.id}`}>
                    <td>{index + 1}</td>
                    <td>{sale.invoice_no}</td>
                    <td>{formatDate(sale.invoice_date)}</td>
                    <td>
                      <strong>{sale.customer_name?.trim() || "Walk-in"}</strong>
                      <div className="sub-text">{sale.customer_phone || "-"}</div>
                    </td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.selling_price)}</td>

                    {itemIndex === 0 && (
                      <>
                        <td rowSpan={sale.items.length || 1}>
                          {money(sale.total_amount)}
                        </td>
                        <td rowSpan={sale.items.length || 1}>
                          {money(sale.total_paid)}
                        </td>
                        <td
                          rowSpan={sale.items.length || 1}
                          className="balance-cell"
                        >
                          {money(sale.balance_due)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {sales.length > 0 && (
              <tr className="sales-total-row">
                <td colSpan="7">GRAND TOTAL</td>
                <td>{money(summary.sales_sum)}</td>
                <td>{money(summary.paid_sum)}</td>
                <td>{money(summary.balance_sum)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingSales;

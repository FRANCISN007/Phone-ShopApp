import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./StaffSalesReport.css";

const StaffSalesReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [sales, setSales] = useState([]);
  const [staffId, setStaffId] = useState(""); // will hold selected staff's ID
  const [staffList, setStaffList] = useState([]); // dropdown options
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [show, setShow] = useState(true); // NEW: controls visibility

  // Fetch sales report
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (staffId) params.staff_id = staffId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axiosWithAuth().get("/sales/report/staff", { params });
      setSales(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load staff sales report");
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff list for dropdown
  const fetchStaffList = async () => {
    try {
      const res = await axiosWithAuth().get("/users/");
      // Ensure staffList is always an array
      setStaffList(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load staff list");
    }
  };


  // Format amount with commas, no decimals
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "0";
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    fetchStaffList();
    fetchReport();
    // eslint-disable-next-line
  }, []);

  const totalSalesAmount = sales.reduce(
    (sum, sale) => sum + (sale.total_amount || 0),
    0
  );

  if (!show) return null; // hide the component when closed


  return (
    <div className="list-sales-container">
      {/* Close button */}
      <button
        className="close-btn"
        onClick={() => setShow(false)} // hides the page
      >
        ✖
      </button>
      <h2 className="list-sales-title">Staff Sales Report</h2>

      {/* ================= Filters ================= */}
      <div className="sales-filters">
        <label>
          Staff:
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            <option value="">All Staff</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.username}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={fetchReport}>Filter</button>
      </div>

      {loading && <div className="status-text">Loading report...</div>}
      {error && <div className="error-text">{error}</div>}

      {/* ================= Table ================= */}
      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Staff</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Ref</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 && !loading && (
              <tr>
                <td colSpan="10" className="empty-row">
                  No sales found
                </td>
              </tr>
            )}

            {sales.map((sale) =>
              sale.items.map((item, index) => (
                <tr key={`${sale.id}-${item.id}`}>
                  {index === 0 && (
                    <>
                      <td rowSpan={sale.items.length}>
                        {new Date(sale.sold_at).toLocaleString()}
                      </td>
                      <td rowSpan={sale.items.length}>{sale.invoice_no}</td>
                      <td rowSpan={sale.items.length}>
                        {sale.staff_name || "-"}
                      </td>
                      <td rowSpan={sale.items.length}>{sale.customer_name}</td>
                      <td rowSpan={sale.items.length}>
                        {sale.customer_phone || "-"}
                      </td>
                      <td rowSpan={sale.items.length}>{sale.ref_no || "-"}</td>
                    </>
                  )}

                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatAmount(item.selling_price)}</td>
                  <td>{formatAmount(item.total_amount)}</td>
                </tr>
              ))
            )}

            {sales.length > 0 && (
              <tr className="sales-total-row">
                <td colSpan="9">TOTAL SALES</td>
                <td>{formatAmount(totalSalesAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffSalesReport;

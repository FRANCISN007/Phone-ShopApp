import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListSalesPayment.css";

const ListSalesPayment = () => {
  const today = new Date().toISOString().split("T")[0];

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState("");
  const [bankId, setBankId] = useState("");

  const [banks, setBanks] = useState([]); // Bank list for filter
  const [show, setShow] = useState(true); // Controls visibility

  /* ================= Fetch Banks ================= */
  const fetchBanks = useCallback(async () => {
    try {
      const res = await axiosWithAuth().get("/bank/simple");
      setBanks(res.data || []);
    } catch (err) {
      console.error("Failed to load banks:", err);
    }
  }, []);

  /* ================= Fetch Payments ================= */
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (status) params.status = status;
      if (bankId) params.bank_id = bankId;

      const res = await axiosWithAuth().get("/payments/", { params });
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, bankId]);

  useEffect(() => {
    fetchBanks();
    fetchPayments();
  }, [fetchBanks, fetchPayments]);

  /* ================= Totals ================= */
  const totals = useMemo(() => {
    return payments.reduce(
      (acc, p) => {
        acc.amount_paid += p.amount_paid || 0;
        acc.balance_due += p.balance_due || 0;
        acc.total_sales += p.total_amount || 0;
        return acc;
      },
      { amount_paid: 0, balance_due: 0, total_sales: 0 }
    );
  }, [payments]);

  const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-US");

  if (!show) return null; // hide component

  return (
    <div className="sales-payment-container">
      {/* Close Button */}
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2 className="sales-payment-title">📄 Sales Payments Report</h2>

      {/* ================= Filters ================= */}
      <div className="sales-payment-filters">
        <label>From:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>To:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="part_paid">Part Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <label>Bank:</label>
        <select value={bankId} onChange={(e) => setBankId(e.target.value)}>
          <option value="">All</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button onClick={fetchPayments}>Filter</button>
      </div>

      {/* ================= Status ================= */}
      {loading && <div className="sales-payment-status-text">Loading...</div>}
      {error && <div className="sales-payment-error-text">{error}</div>}

      {/* ================= Table ================= */}
      <div className="sales-payment-table-wrapper">
        <table className="sales-payment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice No</th>
              <th>Payment Date</th>
              <th>Total Sale</th>
              <th>Amount Paid</th>
              <th>Discount</th>
              <th>Balance Due</th>
              <th>Method</th>
              <th>Bank</th>
              <th>Status</th>
              <th>Created By</th>
              
              
            </tr>
          </thead>

          <tbody>
            {!loading && payments.length === 0 ? (
              <tr>
                <td colSpan="11" className="sales-payment-empty-row">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.invoice_no ?? p.sale_invoice_no}</td>
                  <td>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}</td>
                  <td>{formatAmount(p.total_amount)}</td>
                  <td>{formatAmount(p.amount_paid)}</td>
                  <td>{formatAmount(p.discount_allowed)}</td>
                  <td>{formatAmount(p.balance_due)}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.bank_name || "-"}</td>
                  <td>{p.status}</td>
                  <td>{p.created_by_name || "-"}</td>
                  
                  
                </tr>
              ))
            )}
          </tbody>

          {/* ================= Totals Row ================= */}
            {payments.length > 0 && (
              <tfoot>
                <tr className="sales-total-row">
                  <td colSpan="3">TOTAL</td>
                  <td>{formatAmount(totals.total_sales)}</td>  {/* Total Sale */}
                  <td>{formatAmount(totals.amount_paid)}</td> {/* Amount Paid */}
                  <td></td>                                    {/* Discount */}
                  <td>{formatAmount(totals.balance_due)}</td>  {/* Balance Due */}
                  <td colSpan="4"></td>                        {/* Method, Bank, Status, Created By */}
                </tr>
              </tfoot>
            )}

        </table>
      </div>
    </div>
  );
};

export default ListSalesPayment;

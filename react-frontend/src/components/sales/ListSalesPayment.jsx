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
  const [invoiceNo, setInvoiceNo] = useState(""); // <-- New state for invoice filter

  const [banks, setBanks] = useState([]);
  const [show, setShow] = useState(true);

  /* ================= Fetch Banks ================= */
  const fetchBanks = useCallback(async () => {
    try {
      const res = await axiosWithAuth().get("/bank/simple");
      setBanks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch banks", err);
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
      if (invoiceNo) params.invoice_no = invoiceNo; // <-- Include invoice filter

      const res = await axiosWithAuth().get("/payments/", { params });
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, bankId, invoiceNo]);

  useEffect(() => {
    fetchBanks();
    fetchPayments();
  }, [fetchBanks, fetchPayments]);

  /* ================= Delete Payment ================= */
  const handleDeletePayment = async (paymentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment?"
    );
    if (!confirmDelete) return;

    try {
      await axiosWithAuth().delete(`/payments/${paymentId}`);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete payment");
    }
  };

  /* ================= Totals ================= */
  const totals = useMemo(() => {
    const invoiceMap = new Map();
    let totalPaid = 0;

    payments.forEach((p) => {
      const invoiceNo = p.invoice_no ?? p.sale_invoice_no;
      totalPaid += p.amount_paid || 0;

      if (!invoiceMap.has(invoiceNo)) {
        invoiceMap.set(invoiceNo, {
          total_amount: p.total_amount || 0,
          balance_due: p.balance_due || 0,
        });
      }
    });

    let totalSales = 0;
    let totalBalance = 0;

    invoiceMap.forEach((inv) => {
      totalSales += inv.total_amount;
      totalBalance += inv.balance_due;
    });

    return {
      total_sales: totalSales,
      amount_paid: totalPaid,
      balance_due: totalBalance,
    };
  }, [payments]);

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-US");

  if (!show) return null;

  return (
    <div className="sales-payment-container">
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2 className="sales-payment-title">📄 Sales Payments Report</h2>

      {/* ================= Filters ================= */}
      <div className="sales-payment-filters">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Invoice No"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          style={{ padding: "5px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="part_paid">Part Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <select value={bankId} onChange={(e) => setBankId(e.target.value)}>
          <option value="">All Banks</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button onClick={fetchPayments}>Filter</button>
      </div>

      {/* ================= Status ================= */}
      {loading && (
        <div className="sales-payment-status-text">
          Loading payments...
        </div>
      )}

      {error && (
        <div className="sales-payment-error-text">{error}</div>
      )}

      {/* ================= Table ================= */}
      {!loading && (
        <table className="sales-payment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Method</th>
              <th>BANK</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="9" className="sales-payment-empty-row">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.invoice_no ?? p.sale_invoice_no}</td>
                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td>{formatAmount(p.total_amount)}</td>
                  <td>{formatAmount(p.amount_paid)}</td>
                  <td>{formatAmount(p.balance_due)}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.bank_name}</td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      className="delete-icon-btn"
                      title="Delete Payment"
                      onClick={() => handleDeletePayment(p.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {payments.length > 0 && (
            <tfoot>
              <tr className="sales-total-row">
                <td colSpan="3">TOTAL</td>
                <td style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  {formatAmount(totals.total_sales)}
                </td>
                <td style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  {formatAmount(totals.amount_paid)}
                </td>
                <td style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  {formatAmount(totals.balance_due)}
                </td>
                <td colSpan="4"></td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
};

export default ListSalesPayment;

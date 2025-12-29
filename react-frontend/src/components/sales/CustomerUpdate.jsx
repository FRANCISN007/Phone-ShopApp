import React, { useState, useEffect } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CustomerUpdate.css";

const CustomerUpdate = ({ invoiceNo, onClose }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [refNo, setRefNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch sale details to prefill form
  useEffect(() => {
    if (!invoiceNo) return; // ✅ safe guard, hook still runs

    const fetchSale = async () => {
      try {
        const axiosInstance = axiosWithAuth();
        const sale = (await axiosInstance.get(`/sales/${invoiceNo}`)).data;

        setCustomerName(sale.customer_name || "");
        setCustomerPhone(sale.customer_phone || "");
        setRefNo(sale.ref_no || "");
      } catch (err) {
        console.error("❌ Failed to fetch sale:", err);
        setError("Failed to load sale details");
      }
    };

    fetchSale();
  }, [invoiceNo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!invoiceNo) {
      setError("No invoice selected for update");
      setLoading(false);
      return;
    }

    try {
      const axiosInstance = axiosWithAuth();
      await axiosInstance.put(`/sales/${invoiceNo}`, {
        customer_name: customerName,
        customer_phone: customerPhone,
        ref_no: refNo,
      });

      setSuccess("Customer details updated successfully!");
      setTimeout(() => {
        setSuccess("");
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Failed to update sale:", err);
      setError(err.response?.data?.detail || "Failed to update sale");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-update-overlay">
      <div className="customer-update-card">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>Update Customer Details</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Customer Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </label>

          <label>
            Customer Phone
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </label>

          <label>
            Reference No
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
            />
          </label>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerUpdate;

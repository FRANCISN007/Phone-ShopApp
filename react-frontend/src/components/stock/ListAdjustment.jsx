import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListAdjustment.css";

const ListAdjustment = ({ onClose }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Internal visibility fallback
  const [visible, setVisible] = useState(true);

  // Fetch stock adjustments
  const fetchAdjustments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosWithAuth().get("/stock/inventory/adjustments/");
      setAdjustments(res.data);
    } catch (err) {
      console.error("Error fetching adjustments:", err);
      setError("Failed to load stock adjustments");
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  // Delete adjustment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this adjustment?")) return;
    try {
      await axiosWithAuth().delete(`/stock/inventory/adjustments/${id}`);
      setAdjustments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting adjustment:", err);
      alert("Failed to delete adjustment");
    }
  };

  // Close the modal
  const handleClose = () => {
    if (onClose) {
      onClose(); // notify parent
    } else {
      setVisible(false); // fallback internal close
    }
  };

  if (!visible) return null;

  return (
    <div className="list-adjustment-container">
      {/* Close X */}
      <button className="close-btn" onClick={handleClose}>
        ×
      </button>

      <h2 className="list-adjustment-title">Stock Adjustments Report</h2>

      {loading && <p className="status-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="table-wrapper">
        <table className="adjustment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Inventory ID</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Adjusted By</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length > 0 ? (
              adjustments.map((adj) => (
                <tr key={adj.id}>
                  <td>{adj.id}</td>
                  <td>{adj.product_id}</td>
                  <td>{adj.inventory_id}</td>
                  <td>{adj.quantity}</td>
                  <td>{adj.reason}</td>
                  <td>{adj.adjusted_by ?? "-"}</td>
                  <td>{new Date(adj.adjusted_at).toLocaleString()}</td>
                  <td className="action-cell">
                    <button
                      className="delete-btn"
                      title="Delete Adjustment"
                      onClick={() => handleDelete(adj.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-row">
                  No stock adjustments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListAdjustment;

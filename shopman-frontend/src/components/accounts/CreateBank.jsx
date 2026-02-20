import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateBank.css";

const CreateBank = ({ onClose }) => {
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     SAFE CLOSE HANDLER
  ========================= */
  const handleClose = () => {
    if (onClose) onClose();
    else window.history.back(); // fallback
  };

  /* =========================
     FETCH BANKS
  ========================= */
  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await axiosWithAuth().get("/bank/");
      setBanks(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  /* =========================
     CREATE / UPDATE BANK
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Bank name is required");
      return;
    }

    try {
      if (editingId) {
        await axiosWithAuth().put(`/bank/${editingId}`, { name });
      } else {
        await axiosWithAuth().post("/bank/", { name });
      }

      setName("");
      setEditingId(null);
      fetchBanks();
    } catch (err) {
      alert(err.response?.data?.detail || "Operation failed");
    }
  };

  /* =========================
     EDIT BANK
  ========================= */
  const handleEdit = (bank) => {
    setEditingId(bank.id);
    setName(bank.name);
  };

  /* =========================
     DELETE BANK
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bank?")) return;

    try {
      await axiosWithAuth().delete(`/bank/${id}`);
      fetchBanks();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="create-bank-container compact">

      {/* CLOSE BUTTON */}
      <button className="close-btn" onClick={handleClose}>✕</button>

      <h2 className="create-bank-title">Manage Banks</h2>

      {/* ================= CREATE / EDIT FORM ================= */}
      <form className="compact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter New Bank name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit">{editingId ? "Update" : "Create"}</button>

        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">
        {loading && <p className="status-text">Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        <table className="bank-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bank Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banks.length === 0 && !loading ? (
              <tr>
                <td colSpan="3" className="empty-row">No banks found</td>
              </tr>
            ) : (
              banks.map((bank, index) => (
                <tr key={bank.id}>
                  <td>{index + 1}</td>
                  <td>{bank.name}</td>
                  <td className="action-cell">
                    <button
                      className="icon-btn edit-btn"
                      title="Edit"
                      onClick={() => handleEdit(bank)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(bank.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateBank;

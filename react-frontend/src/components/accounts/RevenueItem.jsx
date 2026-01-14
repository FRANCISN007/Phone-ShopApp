import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./RevenueItem.css";

const RevenueItem = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH CATEGORIES
  ========================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosWithAuth().get("/stock/category/");
      setCategories(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Revenue item name is required");
      return;
    }

    try {
      if (editingId) {
        await axiosWithAuth().put(`/stock/category/${editingId}`, {
          name,
          description,
        });
      } else {
        await axiosWithAuth().post("/stock/category/", {
          name,
          description,
        });
      }

      setName("");
      setDescription("");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.detail || "Operation failed");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this revenue item?"))
      return;

    try {
      await axiosWithAuth().delete(`/stock/category/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="revenue-item-container">
      <h2 className="revenue-item-title">Revenue Items</h2>

      {/* ================= CREATE / EDIT FORM ================= */}
      <form className="revenue-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Revenue Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">
          {editingId ? "Update" : "Create"}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
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

        <table className="revenue-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Revenue Item</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && !loading ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No revenue items found
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{index + 1}</td>
                  <td>{cat.name}</td>
                  <td>{cat.description || "-"}</td>
                  <td>
                    {new Date(cat.created_at).toLocaleDateString()}
                  </td>
                  <td className="action-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
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

export default RevenueItem;

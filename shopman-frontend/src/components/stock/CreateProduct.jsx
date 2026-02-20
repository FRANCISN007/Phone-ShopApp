import React, { useState, useEffect, useRef } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateProduct.css";

const CreateProduct = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    cost_price: "",
    selling_price: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visible, setVisible] = useState(true); // <-- internal visibility state

  const modalTimerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosWithAuth().get("/stock/category/simple");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!form.category) {
      setError("Please select a category");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosWithAuth().post("/stock/products/", {
        name: form.name.trim(),
        category: form.category,
        type: form.type || null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        selling_price: form.selling_price ? parseFloat(form.selling_price) : null,
      });

      setSuccess(`Product "${res.data.name}" created successfully`);
      setForm({ name: "", category: "", type: "", cost_price: "", selling_price: "" });
      setShowSuccessModal(true);

      modalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccess("");
      }, 2000);

    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    if (onClose) {
      onClose(); // notify parent
    } else {
      setVisible(false); // fallback: hide the card
    }
  };

  if (!visible) return null; // hide the component if closed

  return (
    <div className="stock-page">
      <div className="stock-card">
        <button className="card-close" onClick={handleCloseForm}>✖</button>

        <h2>Create Product</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="enter name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Type</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g. type of product"
            />
          </div>

          <div className="form-group">
            <label>Cost Price (Optional)</label>
            <input
              type="number"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
              placeholder="e.g. 450000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Selling Price (Optional)</label>
            <input
              type="number"
              name="selling_price"
              value={form.selling_price}
              onChange={handleChange}
              placeholder="e.g. 520000"
              min="0"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Success!</h3>
            <p>{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProduct;

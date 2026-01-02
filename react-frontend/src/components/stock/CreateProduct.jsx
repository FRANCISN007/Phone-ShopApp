import React, { useState, useEffect } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateProduct.css";

const CreateProduct = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
  });

  const [categories, setCategories] = useState([]); // ✅ store categories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= FETCH CATEGORIES =================
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

  // ================= HANDLE FORM CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= HANDLE FORM SUBMIT =================
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
        category: form.category, // now selected category
        brand: form.brand || null,
      });

      setSuccess(`Product "${res.data.name}" created successfully`);
      setForm({ name: "", category: "", brand: "" });
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

  return (
    <div className="stock-page">
      <div className="stock-card">
        <h2>Create Product</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 14"
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
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Apple"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;

import React, { useState, useEffect, useRef } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateProduct.css";

const CreateProduct = ({ onClose, isSuperAdmin = true }) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    cost_price: "",
    selling_price: "",
    sku: "",
    barcode: "",
    business_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessSearch, setBusinessSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const modalTimerRef = useRef(null);

  /* ===============================
     FETCH CATEGORIES
  =============================== */
  useEffect(() => {
    axiosWithAuth()
      .get("/stock/category/simple")
      .then((res) => setCategories(res.data || []))
      .catch(() => setError("Cannot load categories"));
  }, []);

  /* ===============================
     FETCH BUSINESSES (SUPER ADMIN)
  =============================== */
  useEffect(() => {
    if (!isSuperAdmin) return;

    axiosWithAuth()
      .get("/business/simple")
      .then((res) => setBusinesses(res.data || []))
      .catch(() => setError("Cannot load businesses"));
  }, [isSuperAdmin]);

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(businessSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required");
    if (!form.category) return setError("Category is required");

    if (isSuperAdmin && !form.business_id) {
      return setError("Select a business");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        type: form.type || null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        selling_price: form.selling_price ? Number(form.selling_price) : null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        ...(isSuperAdmin && form.business_id && {
          business_id: Number(form.business_id),
        }),
      };

      const res = await axiosWithAuth().post("/stock/products/", payload);

      setSuccess(`Product "${res.data.name}" created successfully`);
      setShowSuccessModal(true);

      setForm({
        name: "",
        category: "",
        type: "",
        cost_price: "",
        selling_price: "",
        sku: "",
        barcode: "",
        business_id: "",
      });

      modalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-card">
        <button className="card-close" onClick={onClose}>✖</button>

        <h2>Create Product</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* BUSINESS */}
          {isSuperAdmin && (
            <div className="form-group">
              <label>Business *</label>
              <input
                type="text"
                placeholder="Search business..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
              />

              <select
                name="business_id"
                value={form.business_id}
                onChange={handleChange}
                required
              >
                <option value="">Select business</option>
                {filteredBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* NAME */}
          <div className="form-group">
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div className="form-group">
            <label>Type</label>
            <input name="type" value={form.type} onChange={handleChange} />
          </div>

          {/* SKU */}
          <div className="form-group">
            <label>SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} />
          </div>

          {/* BARCODE */}
          <div className="form-group">
            <label>Barcode</label>
            <input name="barcode" value={form.barcode} onChange={handleChange} />
          </div>

          {/* COST */}
          <div className="form-group">
            <label>Cost Price</label>
            <input
              type="number"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
            />
          </div>

          {/* SELLING */}
          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="number"
              name="selling_price"
              value={form.selling_price}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal success">
            <h3>Success</h3>
            <p>{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProduct;

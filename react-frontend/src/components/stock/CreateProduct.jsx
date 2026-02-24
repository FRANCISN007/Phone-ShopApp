import React, { useState, useEffect, useRef } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateProduct.css";

// Replace / improve this detection logic in real app
// Example: const isSuperAdmin = currentUser?.roles?.includes("super_admin") ?? false;
const CreateProduct = ({ onClose, isSuperAdmin = true }) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    cost_price: "",
    selling_price: "",
    business_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [businessesError, setBusinessesError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visible, setVisible] = useState(true);

  const modalTimerRef = useRef(null);

  // Load categories (all users)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosWithAuth().get("/stock/category/simple");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setError("Cannot load categories");
      }
    };
    fetchCategories();
  }, []);

  // Load businesses — only super admin
  useEffect(() => {
    if (!isSuperAdmin) return;

    setBusinessesLoading(true);
    setBusinessesError(null);

    const fetchBusinesses = async () => {
      try {
        const res = await axiosWithAuth().get("/business/simple", {
          params: { limit: 10 }, // adjust limit as needed
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to load businesses", err);
        setBusinessesError(
          err.response?.data?.detail || "Cannot load business list"
        );
      } finally {
        setBusinessesLoading(false);
      }
    };

    fetchBusinesses();
  }, [isSuperAdmin]);

  const filteredBusinesses = businesses.filter((biz) =>
    biz.name?.toLowerCase().includes(businessSearch.toLowerCase().trim())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSuperAdmin && !form.business_id) {
      setError("Please select a business first");
      return;
    }
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

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        type: form.type.trim() || null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        selling_price: form.selling_price ? Number(form.selling_price) : null,
      };

      if (isSuperAdmin && form.business_id) {
        payload.business_id = Number(form.business_id);
      }

      const res = await axiosWithAuth().post("/stock/products/", payload);

      setSuccess(`Product "${res.data.name}" created successfully`);
      setShowSuccessModal(true);

      // Reset form
      setForm({
        name: "",
        category: "",
        type: "",
        cost_price: "",
        selling_price: "",
        business_id: "",
      });
      setBusinessSearch("");

      modalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccess("");
      }, 2200);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    if (onClose) onClose();
    else setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="stock-page">
      <div className="stock-card">
        <button className="card-close" onClick={handleCloseForm}>
          ✖
        </button>

        <h2>Create Product</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── Business first – only super admin ── */}
          {isSuperAdmin && (
            <div className="form-group">
              <label>Business *</label>

              {businessesLoading && <div className="loading">Loading businesses…</div>}

              {businessesError && <div className="alert error">{businessesError}</div>}

              {!businessesLoading && !businessesError && (
                <>
                  <input
                    type="text"
                    placeholder="Search business name…"
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    autoComplete="off"
                  />

                  <select
                    name="business_id"
                    value={form.business_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Select business —</option>
                    {filteredBusinesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name || "Unnamed"}
                      </option>
                    ))}
                    {filteredBusinesses.length === 0 && businessSearch.trim() && (
                      <option disabled>No matching businesses</option>
                    )}
                  </select>
                </>
              )}
            </div>
          )}

          {/* ── Product name ── */}
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              autoFocus={!isSuperAdmin} // auto focus name when not super admin
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">— Select category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Type (optional)</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g. Beverage, Electronics, Raw Material…"
            />
          </div>

          <div className="form-group">
            <label>Cost Price (optional)</label>
            <input
              type="number"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 450000"
            />
          </div>

          <div className="form-group">
            <label>Selling Price (optional)</label>
            <input
              type="number"
              name="selling_price"
              value={form.selling_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 520000"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Product"}
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
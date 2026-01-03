import React, { useEffect, useState, useMemo } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListProduct.css";

const ListProduct = () => {
  /* ================= State ================= */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState(null);

  // 🔍 Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [show, setShow] = useState(true); // controls visibility of the page

  /* ================= Helpers ================= */

  const formatAmount = (value) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toLocaleString();
  };

  const cleanPrice = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, ""));
  };

  /* ================= Fetch ================= */

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosWithAuth().get("/stock/products/");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosWithAuth().get("/stock/category/simple");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ================= Filtering ================= */

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesName = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || p.category === selectedCategory;

      return matchesName && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  /* ================= Actions ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axiosWithAuth().delete(`/stock/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditProduct({ ...product });
  };

  const handleUpdateProduct = async () => {
    const payload = {
      ...editProduct,
      cost_price: cleanPrice(editProduct.cost_price),
      selling_price: cleanPrice(editProduct.selling_price),
    };

    try {
      const res = await axiosWithAuth().put(
        `/stock/products/${payload.id}`,
        payload
      );

      setProducts((prev) =>
        prev.map((p) => (p.id === payload.id ? res.data : p))
      );
      setEditProduct(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update product");
    }
  };

  /* ================= Render ================= */

  if (!show) return null; // hide page when close button clicked
  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="alert error">{error}</p>;

  return (
    <div className="list-container">
      {/* ================= Close Button ================= */}
      <button
        className="close-btn"
        onClick={() => setShow(false)}
      >
        ✖
      </button>

      <h2>Product List</h2>

      {/* ================= Filters ================= */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= Table ================= */}
      <table className="list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Cost Price</th>
            <th>Selling Price</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No products found.
              </td>
            </tr>
          )}

          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.type || "-"}</td>
              <td>{formatAmount(p.cost_price)}</td>
              <td>{formatAmount(p.selling_price)}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => handleEdit(p)}>
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Edit Modal ================= */}
      {editProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Product</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProduct();
              }}
            >
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={editProduct.category}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category: e.target.value })
                  }
                  required
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
                  value={editProduct.type || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, type: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Cost Price</label>
                <input
                  type="text"
                  value={editProduct.cost_price}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, cost_price: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Selling Price</label>
                <input
                  type="text"
                  value={editProduct.selling_price}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, selling_price: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;

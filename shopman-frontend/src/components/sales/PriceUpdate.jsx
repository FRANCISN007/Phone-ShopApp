import React, { useState, useRef } from "react"; // ✅ removed useEffect
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./PriceUpdate.css";

const PriceUpdate = () => {
  const [show, setShow] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTimeout = useRef(null);

  // -----------------------------
  // Fetch products as user types
  // -----------------------------
  const fetchProducts = async (query) => {
    if (!query) {
      setProducts([]);
      return;
    }

    try {
      const res = await axiosWithAuth().get("/stock/products/search", {
        params: { query },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedProduct(null);

    // debounce to avoid calling backend on every keystroke
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  };

  // -----------------------------
  // Handle price update submission
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return setMessage("❌ Please select a product.");
    if (!sellingPrice || Number(sellingPrice) < 0)
      return setMessage("❌ Please enter a valid selling price.");

    setLoading(true);
    setMessage("");

    try {
      await axiosWithAuth().put(
        `/stock/products/${selectedProduct.id}/price`,
        { selling_price: Number(sellingPrice) }
      );

      setMessage(`✅ Price for "${selectedProduct.name}" updated successfully.`);
      setSellingPrice("");
      setSearch("");
      setSelectedProduct(null);
      setProducts([]);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.detail || "❌ Failed to update price.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Close modal
  // -----------------------------
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="price-card">
        <button className="card-close" onClick={() => setShow(false)}>
          ×
        </button>

        <h2>Update Product Price</h2>

        <form className="form-group" onSubmit={handleSubmit}>
          <label>Product</label>
          <input
            type="text"
            placeholder="Search product name..."
            value={search}
            onChange={handleSearchChange}
          />

          {search && products.length > 0 && (
            <ul className="dropdown">
              {products.map((p) => (
                <li
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSearch(p.name);
                    setProducts([]); // hide dropdown after select
                  }}
                >
                  {p.name}
                </li>
              ))}
            </ul>
          )}

          <label>New Selling Price</label>
          <input
            type="number"
            min="0"
            placeholder="Enter new price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Price"}
          </button>
        </form>

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default PriceUpdate;

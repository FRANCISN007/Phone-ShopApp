import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListPurchase.css";

const ListPurchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [show, setShow] = useState(true);

  /* =========================
     FILTER STATES
     ========================= */
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  
  // Default startDate = 1st of current month, endDate = today
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDate = (d) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(firstDay));
  const [endDate, setEndDate] = useState(formatDate(today));

  /* =========================
     PRODUCT SEARCH (FILTER + EDIT)
     ========================= */
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  /* =========================
     EDIT MODAL
     ========================= */
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    product_id: "",
    product_name: "",
    quantity: "",
    cost_price: "",
    vendor_id: "",
  });

  /* =========================
     COMPUTED
     ========================= */
  const grandTotal = purchases.reduce(
    (acc, p) => acc + Number(p.total_cost || 0),
    0
  );

  /* =========================
     FETCH PURCHASES (FILTERED)
     ========================= */
  const fetchPurchases = useCallback(async () => {
    try {
      const params = {};
      if (productId) params.product_id = productId;
      if (vendorId) params.vendor_id = vendorId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axiosWithAuth().get("/purchase/", { params });
      setPurchases(res.data);
    } catch {
      console.error("Failed to load purchases");
    }
  }, [productId, vendorId, startDate, endDate]);

  const fetchVendors = async () => {
    try {
      const res = await axiosWithAuth().get("/vendor/simple");
      setVendors(res.data);
    } catch {
      console.error("Failed to load vendors");
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchVendors();
  }, [fetchPurchases]);

  /* =========================
     PRODUCT SEARCH
     ========================= */
  const searchProducts = async (query) => {
    setProductQuery(query);

    if (!query) {
      setProducts([]);
      setProductId("");
      return;
    }

    try {
      setLoadingProducts(true);
      const res = await axiosWithAuth().get(
        `/stock/products/search?query=${query}`
      );
      setProducts(res.data);
    } catch {
      console.error("Product search failed");
    } finally {
      setLoadingProducts(false);
    }
  };

  /* =========================
     FILTER ACTIONS
     ========================= */
  const applyFilters = () => fetchPurchases();

  const resetFilters = () => {
    setVendorId("");
    setProductId("");
    setProductQuery("");
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(today));
    fetchPurchases();
  };

  /* =========================
     DELETE
     ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await axiosWithAuth().delete(`/purchase/${id}`);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  /* =========================
     EDIT
     ========================= */
  const handleEditOpen = (p) => {
    setEditData({
      id: p.id,
      product_id: p.product_id,
      product_name: p.product_name,
      quantity: Number(p.quantity),
      cost_price: Number(p.cost_price),
      vendor_id: p.vendor_id,
    });
    setProductQuery(p.product_name);
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]:
        name === "quantity" || name === "cost_price"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosWithAuth().put(`/purchase/${editData.id}`, {
        product_id: Number(editData.product_id),
        quantity: Number(editData.quantity),
        cost_price: Number(editData.cost_price),
        vendor_id: Number(editData.vendor_id),
      });
      setShowEdit(false);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  if (!show) return null;

  return (
    <div className="list-sales-container">
      <button className="close-btn" onClick={() => setShow(false)}>✖</button>
      <h2 className="outstanding-sales-title">📦 Purchase List</h2>

      {/* ================= FILTER BAR ================= */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search product..."
          value={productQuery}
          onChange={(e) => searchProducts(e.target.value)}
        />

        {products.length > 0 && (
          <ul className="dropdown-list">
            {products.map((p) => (
              <li
                key={p.id}
                onClick={() => {
                  setProductId(p.id);
                  setProductQuery(p.name);
                  setProducts([]);
                  fetchPurchases();
                }}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}

        <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.business_name}</option>
          ))}
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <button onClick={applyFilters}>Apply</button>
        <button onClick={resetFilters}>Reset</button>
      </div>

      {/* ================= TABLE ================= */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Product</th>
            <th>Vendor</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Total</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.purchase_date}</td>
              <td>{p.product_name}</td>
              <td>{p.vendor_name}</td>
              <td>{p.quantity}</td>
              <td>{Number(p.cost_price).toLocaleString("en-NG")}</td>
              <td>{Number(p.total_cost).toLocaleString("en-NG")}</td>
              <td>{p.current_stock}</td>
              <td>
                <button onClick={() => handleEditOpen(p)}>✏️</button>
                <button onClick={() => handleDelete(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}

          <tr className="purchase-grand-total-row">
            <td colSpan="5">GRAND TOTAL</td>
            <td colSpan="4">₦{grandTotal.toLocaleString("en-NG")}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Purchase</h3>

            <form onSubmit={handleEditSubmit}>
              <label>
                Product
                <input
                  type="text"
                  placeholder="Search product..."
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    searchProducts(e.target.value);
                  }}
                />

                {loadingProducts && <div className="dropdown-loading">Searching...</div>}

                {products.length > 0 && (
                  <ul className="dropdown-list">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => {
                          setEditData({
                            ...editData,
                            product_id: p.id,
                            product_name: p.name,
                          });
                          setProductQuery(p.name);
                          setProducts([]);
                        }}
                      >
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  name="quantity"
                  value={editData.quantity}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Cost Price
                <input
                  type="number"
                  name="cost_price"
                  value={editData.cost_price}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Vendor
                <select
                  name="vendor_id"
                  value={editData.vendor_id}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.business_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Update
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEdit(false)}
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

export default ListPurchase;

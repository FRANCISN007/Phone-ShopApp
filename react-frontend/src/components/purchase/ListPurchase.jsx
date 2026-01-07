import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListPurchase.css";

const ListPurchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(true);

  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);


  // 🔹 Edit modal state
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
     COMPUTED VALUES
     ========================= */
  const grandTotal = purchases.reduce(
    (acc, p) => acc + Number(p.total_cost || 0),
    0
  );

  /* =========================
     FETCH DATA
     ========================= */
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await axiosWithAuth().get("/purchase/");
      setPurchases(res.data);
    } catch {
      setError("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  const searchProducts = async (query) => {
    if (!query || query.length < 1) {
      setProducts([]);
      return;
    }

    try {
      setLoadingProducts(true);
      const res = await axiosWithAuth().get(
        `/stock/products/search?query=${query}`
      );
      setProducts(res.data);
    } catch {
      console.error("Failed to search products");
    } finally {
      setLoadingProducts(false);
    }
  };


  /* =========================
     DELETE PURCHASE
     ========================= */
  const handleDelete = async (purchaseId) => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await axiosWithAuth().delete(`/purchase/${purchaseId}`);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  /* =========================
     EDIT PURCHASE
     ========================= */
  const handleEditOpen = (purchase) => {
    setEditData({
      id: purchase.id,
      product_id: purchase.product_id,
      product_name: purchase.product_name,
      quantity: Number(purchase.quantity),
      cost_price: Number(purchase.cost_price),
      vendor_id: purchase.vendor_id,
    });

    setProductQuery(purchase.product_name);
    setShowEdit(true);
  };



  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData({
      ...editData,
      [name]:
        name === "quantity" || name === "cost_price"
          ? value === "" ? "" : Number(value)
          : value,
    });
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (
      editData.quantity === "" ||
      isNaN(editData.quantity)
    ) {
      alert("Quantity must be a valid number");
      return;
    }

    try {
      await axiosWithAuth().put(`/purchase/${editData.id}`, {
        product_id: Number(editData.product_id),
        quantity: Number(editData.quantity),     // ✅ enforce number
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
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2 className="outstanding-sales-title">📦 Purchase List</h2>

      {loading && <div className="status-text">Loading purchases...</div>}
      {error && <div className="error-text">{error}</div>}

      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Vendor Name</th>
              <th>Quantity</th>
              <th>Cost Price</th>
              <th>Total Cost</th>
              <th>Current Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {purchases.length === 0 && !loading ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  No purchases found
                </td>
              </tr>
            ) : (
              <>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.product_id}</td>
                    <td>{p.product_name}</td>
                    <td>{p.vendor_name}</td>
                    <td>{p.quantity}</td>
                    <td>{Number(p.cost_price).toLocaleString("en-NG")}</td>
                    <td>{Number(p.total_cost).toLocaleString("en-NG")}</td>
                    <td>{p.current_stock}</td>
                    <td className="action-cell">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditOpen(p)}
                      >
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

                <tr className="purchase-grand-total-row">
                  <td colSpan="5" className="purchase-grand-total-label">
                    GRAND TOTAL
                  </td>
                  <td className="purchase-grand-total-amount">
                    ₦{grandTotal.toLocaleString("en-NG")}
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

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

import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListInventory.css";

const ListInventory = ({ onClose }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState(""); // search input


  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const res = await axiosWithAuth().get("/stock/inventory/", {
        params: {
            skip: 0,
            limit: 100,
            product_name: searchName.trim() || undefined, // send filter only if not empty
        },
        });

        const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

        setInventory(data);

    } catch (err) {
        console.error(err);
        setError("Failed to load inventory list");
    } finally {
        setLoading(false);
    }
    }, [searchName]);


  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="inventory-container">
      {/* Close button */}
      {onClose && (
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      )}

      <h2 className="inventory-title">Inventory List</h2>

      {loading && <div className="status-text">Loading inventory...</div>}
      {error && <div className="error-text">{error}</div>}

      <div className="inventory-filters">
        <label htmlFor="searchName">Search Product:</label>
        <input
            id="searchName"
            type="text"
            value={searchName}
            placeholder="Enter product name..."
            onChange={(e) => setSearchName(e.target.value)}
        />
        <button onClick={fetchInventory}>Search</button>
        </div>


      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Quantity In</th>
              <th>Quantity Out</th>
              <th>Adjustments</th>
              <th>Current Stock</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && !loading ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  No inventory records found
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity_in}</td>
                  <td>{item.quantity_out}</td>
                  <td>{item.adjustment_total}</td>
                  <td
                    className={
                      item.current_stock < 0 ? "negative-stock" : ""
                    }
                  >
                    {item.current_stock}
                  </td>
                  <td>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(item.updated_at).toLocaleDateString()}
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

export default ListInventory;

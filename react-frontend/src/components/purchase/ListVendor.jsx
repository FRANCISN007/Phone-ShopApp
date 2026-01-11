// src/components/purchase/ListVendor.jsx
import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListVendor.css";

const ListVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosWithAuth().get("/vendor/");
      setVendors(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load vendor list.");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await axiosWithAuth().delete(`/vendor/${id}`);
      setVendors(vendors.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete vendor.");
    }
  };

  const handleEdit = async (vendor) => {
    // Prompt all fields
    const business_name = prompt("Business Name:", vendor.business_name);
    if (business_name === null) return; // cancel

    const address = prompt("Address:", vendor.address);
    if (address === null) return;

    const phone_number = prompt("Phone Number:", vendor.phone_number);
    if (phone_number === null) return;

    try {
      const response = await axiosWithAuth().put(`/vendor/${vendor.id}`, {
        business_name,
        address,
        phone_number,
      });
      setVendors(vendors.map((v) => (v.id === vendor.id ? response.data : v)));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update vendor.");
    }
  };

  if (!show) return null;

  return (
    <div className="list-vendor-container">
      {/* Close button */}
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2 className="list-vendor-title">📋 Vendor List</h2>

      {loading && <p className="status-text">Loading vendors...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Business Name</th>
                <th>Address</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, index) => (
                  <tr key={vendor.id}>
                    <td>{index + 1}</td>
                    <td>{vendor.business_name}</td>
                    <td>{vendor.address}</td>
                    <td>{vendor.phone_number}</td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(vendor)}
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(vendor.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListVendor;

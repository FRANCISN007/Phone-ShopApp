// src/components/purchase/CreateVendor.jsx
import React, { useState, useEffect } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreateVendor.css";

const CreateVendor = () => {
  const [vendor, setVendor] = useState({
    business_name: "",
    address: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(true); // controls form visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor({ ...vendor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendor.business_name || !vendor.address || !vendor.phone_number) {
      setErrorMsg("All fields are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await axiosWithAuth().post("/vendor/", vendor);
      setSuccessMsg(`Vendor "${res.data.business_name}" created successfully!`);
      setVendor({ business_name: "", address: "", phone_number: "" });
    } catch (error) {
      setErrorMsg(
        error.response?.data?.detail || "Failed to create vendor. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (!show) return null; // Hide form if closed

  return (
    <div className="create-vendor-container">
      {/* Close button */}
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2>Create Vendor</h2>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <form className="vendor-form" onSubmit={handleSubmit}>
        <label>
          Business Name:
          <input
            type="text"
            name="business_name"
            value={vendor.business_name}
            onChange={handleChange}
            placeholder="Enter business name"
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={vendor.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </label>

        <label>
          Phone Number:
          <input
            type="text"
            name="phone_number"
            value={vendor.phone_number}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Vendor"}
        </button>
      </form>
    </div>
  );
};

export default CreateVendor;

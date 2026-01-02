import React, { useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ImportProduct.css";

const ImportProduct = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true); // modal visible by default

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an Excel file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // MUST match backend param name

    setLoading(true);
    setMessage("");

    try {
      const res = await axiosWithAuth().post(
        "/stock/products/import-excel",
        formData
      );

      setMessage(
        `✅ Import completed: ${res.data.imported} imported, ${res.data.skipped} skipped.`
      );
      setFile(null);
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;
      setMessage(
        typeof detail === "string"
          ? detail
          : detail?.message || "Import failed."
      );
    } finally {
      setLoading(false);
    }
  };


  // ✅ Close modal
  const handleClose = () => setShow(false);

  // ✅ THIS IS THE FIX
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="import-card">
        <button className="card-close" onClick={handleClose}>
          ×
        </button>

        <h2>Import Products</h2>

        <form className="form-group" onSubmit={handleImport}>
          <label htmlFor="file">Select Excel File</label>
          <input
            id="file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Importing..." : "Submit"}
          </button>
        </form>

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default ImportProduct;

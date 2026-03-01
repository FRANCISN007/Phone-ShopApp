import React, { useEffect, useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./CreatePurchase.css";

/* ========= Helpers ========= */
const formatNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return Number(value).toLocaleString("en-NG");
};

const stripCommas = (value) => value.replace(/,/g, "");

/* ========= Empty Row ========= */
const emptyRow = {
  productQuery: "",
  productId: "",
  products: [],
  quantity: "",
  unitPrice: "",
  total: 0,
};

const CreatePurchase = ({ onClose, currentUser }) => {
  const roles = currentUser?.roles || [];
  const isSuperAdmin = roles.includes("super_admin");

  const [vendors, setVendors] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [vendorId, setVendorId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);

  /* ===================== Fetch Data ===================== */
  useEffect(() => {
    fetchVendors();
    if (isSuperAdmin) fetchBusinesses();
    setPurchaseDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axiosWithAuth().get("/vendor/simple");
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch {
      setVendors([]);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axiosWithAuth().get("/business/simple");
      setBusinesses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setBusinesses([]);
    }
  };

  const searchProducts = async (index, query) => {
    if (!query || query.length < 2) return;
    try {
      const res = await axiosWithAuth().get("/stock/products/search", {
        params: { query, business_id: businessId || undefined },
      });
      const updated = [...rows];
      updated[index].products = Array.isArray(res.data) ? res.data : [];
      setRows(updated);
    } catch {}
  };

  /* ===================== Row Handlers ===================== */
  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    if (field === "unitPrice") value = stripCommas(value);
    updated[index][field] = value;

    const qty = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].unitPrice) || 0;
    updated[index].total = qty * price;

    setRows(updated);
  };

  const handleProductSelect = (index, product) => {
    const updated = [...rows];
    updated[index].productId = product.id;
    updated[index].productQuery = product.name;
    updated[index].products = [];
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  /* ===================== Submit ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!invoiceNo) {
      setMessage("❌ Invoice number is required");
      return;
    }

    if (isSuperAdmin && !businessId) {
      setMessage("❌ Please select a business");
      return;
    }

    const items = rows
      .filter((r) => r.productId && r.quantity && r.unitPrice)
      .map((r) => ({
        product_id: Number(r.productId),
        quantity: Number(r.quantity),
        cost_price: Number(r.unitPrice),
      }));

    if (items.length === 0) {
      setMessage("❌ At least one valid item is required");
      return;
    }

    try {
      await axiosWithAuth().post("/purchase/", {
        invoice_no: invoiceNo,
        vendor_id: vendorId ? Number(vendorId) : null,
        business_id: businessId || undefined,
        purchase_date: purchaseDate,
        items,
      });

      setMessage("✅ Purchase saved successfully");
      setRows([{ ...emptyRow }]);
      setVendorId("");
      setInvoiceNo("");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setBusinessId("");
    } catch (err) {
      setMessage(err.response?.data?.detail || "❌ Failed to save purchase");
    }
  };

  const invoiceTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.total) || 0),
    0
  );

  if (!visible) return null;
  const handleClose = () => {
    if (onClose) onClose();
    else setVisible(false);
  };

  /* ===================== Render ===================== */
  return (
    <div className="create-purchase-container">
      <button className="close-btn" onClick={handleClose}>✖</button>
      <h2>Add New Purchase</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="purchase-form">
        <div className="form-grid">
          {/* Vendor */}
          <div className="form-group">
            <label>Vendor</label>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.business_name || v.name}</option>
              ))}
            </select>
          </div>

          {/* Purchase Date */}
          <div className="form-group">
            <label>Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          {/* Invoice Number */}
          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              required
            />
          </div>

          {/* Business (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="form-group">
              <label>Business</label>
              <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} required>
                <option value="">Select Business</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ITEMS TABLE */}
        <div className="purchase-items-table">
          <div className="table-header">
            <span>Product</span>
            <span>Qty</span>
            <span>Unit Cost</span>
            <span>Total</span>
            <span>Action</span>
          </div>

          {rows.map((row, index) => (
            <div className="table-row" key={index}>
              <div className="product-search">
                <input
                  type="text"
                  value={row.productQuery}
                  placeholder="Search product..."
                  onChange={(e) => {
                    handleRowChange(index, "productQuery", e.target.value);
                    searchProducts(index, e.target.value);
                  }}
                  required
                />
                {row.products.length > 0 && (
                  <div className="product-dropdown">
                    {row.products.map((p) => (
                      <div
                        key={p.id}
                        className="product-option"
                        onClick={() => handleProductSelect(index, p)}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="number"
                value={row.quantity}
                onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                required
              />

              <input
                type="text"
                value={formatNumber(row.unitPrice)}
                onChange={(e) => handleRowChange(index, "unitPrice", e.target.value)}
                required
              />

              <input type="text" value={formatNumber(row.total)} readOnly />

              <button type="button" className="remove-btn" onClick={() => removeRow(index)}>
                ✖
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="add-row-btn" onClick={addRow}>+ Add Item</button>

        <div className="invoice-total"><strong>Total:</strong> {formatNumber(invoiceTotal)}</div>

        <button type="submit" className="submit-button">Add Purchase</button>
      </form>
    </div>
  );
};

export default CreatePurchase;

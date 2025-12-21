import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PosSales.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${window.location.hostname}:8000`;

const PosSales = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [saleItems, setSaleItems] = useState([{ productId: "", quantity: 1, sellingPrice: 0 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bankId, setBankId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [refNo, setRefNo] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // Fetch products and banks on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/stock/products/simple`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data))
      .catch(console.error);

    axios
      .get(`${API_BASE_URL}/banks/simple`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBanks(res.data))
      .catch(console.error);

    // Generate invoice number immediately
    const generateInvoice = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sales/invoice/generate`, { headers: { Authorization: `Bearer ${token}` } });
        setInvoiceNo(res.data.invoice_no);
      } catch {
        setInvoiceNo(`INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      }
    };
    generateInvoice();
  }, []);

  // Add a new sale row
  const addItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, sellingPrice: 0 }]);
  };

  // Update row values
  const updateItem = (index, key, value) => {
    const newItems = [...saleItems];
    newItems[index][key] = value;

    // Auto-fill price when product is selected
    if (key === "productId") {
      const product = products.find(p => p.id === Number(value));
      newItems[index].sellingPrice = product ? product.selling_price || 0 : 0;
    }

    setSaleItems(newItems);
  };

  // Remove row
  const removeItem = (index) => {
    const newItems = [...saleItems];
    newItems.splice(index, 1);
    setSaleItems(newItems);
  };

  // Total calculation
  const totalAmount = saleItems.reduce((acc, item) => acc + item.quantity * item.sellingPrice, 0);

  // Submit sale
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      for (const item of saleItems) {
        if (!item.productId) continue;

        await axios.post(
          `${API_BASE_URL}/sales/`,
          {
            product_id: item.productId,
            quantity: item.quantity,
            selling_price: item.sellingPrice,
            payment_method: paymentMethod,
            bank_id: paymentMethod !== "cash" ? bankId : null,
            customer_name: customerName,
            customer_phone: customerPhone,
            ref_no: refNo,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Sale completed successfully!");
      setSaleItems([{ productId: "", quantity: 1, sellingPrice: 0 }]);
      setCustomerName("");
      setCustomerPhone("");
      setBankId("");
      setRefNo("");
      setShowBankDropdown(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Error creating sale");
    }
  };

  return (
    <div className="pos-sales-container">
      <h2 className="pos-heading">POS Sales Entry</h2>

      {/* Top Info */}
      <div className="pos-top-info">
        <div className="input-group">
          <label>Customer Name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Customer Phone</label>
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setShowBankDropdown(false);
            }}
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="pos">POS</option>
          </select>
        </div>

        <div className="input-group">
          <label>Ref No</label>
          <input value={refNo} onChange={(e) => setRefNo(e.target.value)} />
        </div>

        {invoiceNo && <div className="invoice-no">Invoice No: {invoiceNo}</div>}

        {/* Show Bank Dropdown only after Payment button clicked */}
        {showBankDropdown && paymentMethod !== "cash" && (
          <div className="input-group">
            <label>Select Bank</label>
            <select value={bankId} onChange={(e) => setBankId(e.target.value)}>
              <option value="">--Select--</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
          </div>
        )}

        {paymentMethod !== "cash" && !showBankDropdown && (
          <button onClick={() => setShowBankDropdown(true)}>Select Bank</button>
        )}
      </div>

      {/* Sale Items Table */}
      <table className="pos-sales-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map((item, index) => (
            <tr key={index}>
              <td>
                <select value={item.productId} onChange={(e) => updateItem(index, "productId", e.target.value)}>
                  <option value="">--Select--</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={item.sellingPrice}
                  onChange={(e) => updateItem(index, "sellingPrice", Number(e.target.value))}
                />
              </td>
              <td>{item.quantity * item.sellingPrice}</td>
              <td>
                <button className="remove-btn" onClick={() => removeItem(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pos-bottom-actions">
        <button className="add-btn" onClick={addItem}>Add Product</button>
        <div className="total-display">Total: {totalAmount}</div>
        <button className="submit-btn" onClick={handleSubmit}>Complete Sale</button>
      </div>
    </div>
  );
};

export default PosSales;

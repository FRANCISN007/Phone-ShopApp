import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./PosSales.css";

import { SHOP_NAME } from "../../config/constants";


const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${window.location.hostname}:8000`;

const PosSales = ({ onClose }) => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [saleItems, setSaleItems] = useState([
    { productId: "", quantity: 1, sellingPrice: 0 }
  ]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bankId, setBankId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [refNo, setRefNo] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const receiptRef = useRef(null);

  /* ===============================
     Currency Formatter
  ================================ */
  const formatCurrency = (amount) => {
    return `N${Number(amount || 0).toLocaleString("en-NG")}`;
  };

  /* ===============================
     Fetch data on mount
  ================================ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    axios.get(`${API_BASE_URL}/stock/products/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setProducts(res.data))
      .catch(console.error);

    axios.get(`${API_BASE_URL}/banks/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setBanks(res.data))
      .catch(console.error);

    const today = new Date().toISOString().split("T")[0];
    setInvoiceDate(today);

    // ✅ Generate first invoice immediately
    
  }, []);


    

  

  /* ===============================
     Add / Update / Remove Items
  ================================ */
  const addItem = () => {
    setSaleItems([
      ...saleItems,
      { productId: "", quantity: 1, sellingPrice: 0 },
    ]);
  };

  const updateItem = (index, key, value) => {
    const newItems = [...saleItems];
    newItems[index][key] = value;

    if (key === "productId") {
      const product = products.find((p) => p.id === Number(value));
      newItems[index].sellingPrice = product
        ? product.selling_price || 0
        : 0;
    }

    setSaleItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...saleItems];
    newItems.splice(index, 1);
    setSaleItems(newItems);
  };

  /* ===============================
     Total
  ================================ */
  const totalAmount = saleItems.reduce(
    (acc, item) => acc + item.quantity * item.sellingPrice,
    0
  );

  
    

  /* ===============================
    Reset Form
  =============================== */
  const resetForm = () => {
    // Reset everything except invoice
    setSaleItems([{ productId: "", quantity: 1, sellingPrice: 0 }]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("cash");
    setBankId("");
    setRefNo("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
  };



  /* ===============================
     Print Receipt
  ================================ */
  const handlePrintReceipt = (invoice) => {

  const printWindow = window.open("", "", "width=380,height=600");

  const itemsHtml = saleItems
    .map((item) => {
      const product = products.find(
        (p) => p.id === Number(item.productId)
      );
      if (!product) return "";
      return `
        <tr>
          <td>${product.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.sellingPrice)}</td>
          <td style="text-align:right;">${formatCurrency(
            item.quantity * item.sellingPrice
          )}</td>
        </tr>
      `;
    })
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            text-align: left;
          }
          td {
            padding: 4px 0;
          }
          .total {
            font-weight: bold;
            text-align: right;
            margin-top: 8px;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="center bold">${SHOP_NAME}</div>
        <div class="center">SALES RECEIPT</div>

        <hr />

        <div>Invoice: ${invoice}</div>
        <div>Date: ${invoiceDate}</div>
        <div>Customer: ${customerName || "-"}</div>
        <div>Phone: ${customerPhone || "-"}</div>
        <div>Ref No: ${refNo || "-"}</div>
        <div>Payment: ${paymentMethod.toUpperCase()}</div>

        <hr />

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr />

        <div class="total">
          TOTAL: ${formatCurrency(totalAmount)}
        </div>

        <div class="footer">
          Thank you for your patronage
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


const validateSale = () => {
  if (!customerName.trim()) {
    alert("Customer name is required");
    return false;
  }

  if (!paymentMethod) {
    alert("Payment method is required");
    return false;
  }

  

  if (!saleItems.length) {
    alert("Add at least one product");
    return false;
  }

  for (let i = 0; i < saleItems.length; i++) {
    const item = saleItems[i];

    if (!item.productId) {
      alert(`Product not selected on row ${i + 1}`);
      return false;
    }

    if (!item.quantity || item.quantity <= 0) {
      alert(`Invalid quantity on row ${i + 1}`);
      return false;
    }

    if (!item.sellingPrice || item.sellingPrice <= 0) {
      alert(`Invalid selling price on row ${i + 1}`);
      return false;
    }
  }

  if (totalAmount <= 0) {
    alert("Total amount must be greater than zero");
    return false;
  }

  return true;
};



/* ===============================
    Submit Sale
  =============================== */
  // Updated handleSubmit
const handleSubmit = async () => {
  if (!validateSale()) return; // ⛔ STOP HERE IF INVALID

  const token = localStorage.getItem("token");

  try {
    let backendInvoice = "";

    for (let item of saleItems) {
      const res = await axios.post(
        `${API_BASE_URL}/sales/`,
        {
          invoice_date: invoiceDate,
          //payment_method: paymentMethod,
          //bank_id: paymentMethod !== "cash" ? bankId : null,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          ref_no: refNo.trim(),
          product_id: item.productId,
          quantity: item.quantity,
          selling_price: item.sellingPrice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!backendInvoice) {
        backendInvoice = res.data.invoice_no;
      }
    }

    setInvoiceNo(backendInvoice);

    handlePrintReceipt(backendInvoice);

    alert("Sale completed successfully!");

    resetForm();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.detail || "Error creating sale");
  }
};



  return (
    <div className="pos-sales-container">
      {/* ===============================
          Header with Correct Close Button
      ================================ */}
      <div className="pos-header">
        <h2 className="pos-heading">POS Sales Entry</h2>
        <button
          type="button"
          className="pos-close-btn"
          onClick={() => (onClose ? onClose() : window.history.back())}
        >
          ✕
        </button>
      </div>

      {/* ===============================
          Top Info
      ================================ */}
      <div className="pos-meta-grid">

        <div className="input-group">
          <label>Customer Name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Customer Phone</label>
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Invoice Date</label>
          <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>

        

        <div className="input-group">
          <label>Ref No</label>
          <input value={refNo} onChange={(e) => setRefNo(e.target.value)} />
        </div>

        {invoiceNo && <div className="invoice-no">Invoice No: {invoiceNo}</div>}
      </div>

      {/* ===============================
        Sale Items Table
    ================================ */}
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
              <select
                value={item.productId}
                onChange={(e) =>
                  updateItem(index, "productId", e.target.value)
                }
              >
                <option value="">--Select--</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </td>

            <td>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
              />
            </td>

            <td>
              <input
                type="number"
                min="0"
                value={item.sellingPrice}
                onChange={(e) =>
                  updateItem(index, "sellingPrice", Number(e.target.value))
                }
              />
            </td>

            <td>{formatCurrency(item.quantity * item.sellingPrice)}</td>

            <td>
              <button
                className="remove-btn"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}

        {/* ===============================
            ADD PRODUCT ROW INSIDE TABLE
        ================================= */}
        <tr>
          <td colSpan="5" className="add-product-row">
            <button className="add-btn" onClick={addItem}>
              + Add Product
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    {/* ===============================
        GRAND TOTAL (ALIGNED UNDER TOTAL)
    ================================ */}
    <div className="grand-total-container">
      <span className="gt-label">Grand Total</span>
      <span className="gt-amount">
        {formatCurrency(
          saleItems.reduce(
            (sum, item) => sum + item.quantity * item.sellingPrice,
            0
          )
        )}
      </span>
    </div>

    {/* ===============================
        COMPLETE SALE BUTTON CENTERED
    ================================ */}
    <div className="complete-sale-container">
      <button className="submit-btn" onClick={handleSubmit}>
        Complete Sale
      </button>
    </div>  

      </div>
    
  );
};

export default PosSales;

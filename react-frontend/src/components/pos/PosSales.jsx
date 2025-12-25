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


  const [showPayment, setShowPayment] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [createdSaleId, setCreatedSaleId] = useState(null);



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

    axios
    .get(`${API_BASE_URL}/bank/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      if (Array.isArray(res.data)) {
        setBanks(res.data);
      } else {
        console.error("Banks API did not return an array:", res.data);
        setBanks([]);
      }
    })
    .catch((err) => {
      console.error("Failed to load banks:", err);
      setBanks([]);
    });

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
    Amount to Words (Naira)
  ================================ */
  const numberToWords = (num) => {
    if (!num || num === 0) return "Zero Naira Only";

    const ones = [
      "", "One", "Two", "Three", "Four", "Five",
      "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen",
      "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
      "", "", "Twenty", "Thirty", "Forty",
      "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const convertHundreds = (n) => {
      let word = "";

      if (n > 99) {
        word += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }

      if (n > 19) {
        word += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }

      if (n > 0) {
        word += ones[n] + " ";
      }

      return word.trim();
    };

    let words = "";
    let remainder = Math.floor(num);

    if (remainder >= 1_000_000) {
      words += convertHundreds(Math.floor(remainder / 1_000_000)) + " Million ";
      remainder %= 1_000_000;
    }

    if (remainder >= 1_000) {
      words += convertHundreds(Math.floor(remainder / 1_000)) + " Thousand ";
      remainder %= 1_000;
    }

    if (remainder > 0) {
      words += convertHundreds(remainder);
    }

    return `${words.trim()} Naira Only`;
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

  const amountInWords = numberToWords(totalAmount);

  const balance = totalAmount - amountPaid;



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

          <table style="width:100%; font-size:12px;">
            <tr>
              <td><strong>Total:</strong> ${formatCurrency(totalAmount)}</td>
              <td style="text-align:center;"><strong>Paid:</strong> ${formatCurrency(amountPaid)}</td>
              <td style="text-align:right;"><strong>Balance:</strong> ${formatCurrency(balance)}</td>
            </tr>
          </table>


        

        <div style="margin-top:6px; font-size:11px;">
          <strong>Amount in Words:</strong><br/>
          ${amountInWords}
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
  if (!validateSale()) return;

  const token = localStorage.getItem("token");

  try {
    const salePayload = {
      invoice_date: invoiceDate,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || null,
      ref_no: refNo.trim() || null,
      items: saleItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        selling_price: item.sellingPrice,
      })),
    };

    // ✅ ONE REQUEST ONLY
    const saleRes = await axios.post(
      `${API_BASE_URL}/sales/`,
      salePayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const invoice = saleRes.data.invoice_no;
    setInvoiceNo(invoice);

    /* ===============================
       CREATE PAYMENT (uses invoice_no)
    ================================ */
    const paymentPayload = {
      amount_paid: amountPaid,
      payment_method: paymentMethod,
    };

    if (paymentMethod !== "cash") {
      if (!bankId) {
        alert("Please select a bank");
        return;
      }
      paymentPayload.bank_id = bankId;
    }

    if (amountPaid > 0) {
      await axios.post(
        `${API_BASE_URL}/payments/sale/${invoice}`,
        paymentPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }


    handlePrintReceipt(invoice);
    alert("Sale completed successfully");

    resetForm();
    setShowPayment(false);
    setPaymentStatus(null);

    setAmountPaid(0);
    setBankId("");
    setInvoiceNo("");

  } catch (err) {
    console.error(err);
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      alert(detail.map(d => d.msg).join("\n"));
    } else {
      alert(detail || "Transaction failed");
    }
  }
};




  return (
    <div className="pos-sales-container">
  {/* Header */}
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

  {/* Scrollable Form Area */}
  <div className="pos-scrollable-content">
    {/* Top Info */}
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
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, "productId", Number(e.target.value))}
              >
                <option value="">--Select--</option>
                {products.map((p) => (
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
            <td>{formatCurrency(item.quantity * item.sellingPrice)}</td>
            <td>
              <button className="remove-btn" onClick={() => removeItem(index)}>Remove</button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="5" className="add-product-row">
            <button className="add-btn" onClick={addItem}>+ Add Product</button>
          </td>
        </tr>
      </tbody>
    </table>

    {/* Grand Total & Payment Section */}
    <div className="grand-total-container">
      <span className="gt-label">Grand Total</span>
      <span className="gt-amount">{formatCurrency(totalAmount)}</span>

      <div className="pay-area">
        <button className="pay-now-btn" onClick={() => { setShowPayment(true); setAmountPaid(totalAmount); }}>
          Pay Now
        </button>

        {showPayment && (
          <div className="payment-card">
            <div className="payment-title">Payment</div>

            <div className="payment-row compact">
              <label>Amount</label>
              <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
            </div>

            <div className="payment-row compact">
              <label>Method</label>
              <select value={paymentMethod} onChange={(e) => {
                const method = e.target.value;
                setPaymentMethod(method);
                setShowBankDropdown(method !== "cash");
                if (method === "cash") setBankId("");
              }}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="pos">POS</option>
              </select>
            </div>

            {showBankDropdown && (
              <div className="payment-row compact">
                <label>Bank</label>
                <select value={bankId} onChange={(e) => setBankId(e.target.value)}>
                  <option value="">-- Bank --</option>
                  {banks.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="payment-row compact balance-row">
        <label>Balance</label>
        <strong>{formatCurrency(totalAmount - amountPaid)}</strong>
      </div>

    </div>

    {/* Complete Sale Button inside scrollable form */}
    <div className="complete-sale-container">
      <button className="submit-btn" onClick={handleSubmit}>Complete Sale</button>
    </div>
  </div> {/* End pos-scrollable-content */}
</div>

    
  );
};

export default PosSales;

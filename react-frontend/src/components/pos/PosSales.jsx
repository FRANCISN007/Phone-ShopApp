import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PosSales.css";
import { numberToWords } from "../../utils/numberToWords";

import { SHOP_NAME } from "../../config/constants";

// At the top of PosSales.jsx
import { printReceipt } from "../../components/pos/printReceipt";



const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${window.location.hostname}:8000`;

const PosSales = ({ onClose }) => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [saleItems, setSaleItems] = useState([
    { productId: "", quantity: 1, sellingPrice: 0, discount: 0 }
  ]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankId, setBankId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [refNo, setRefNo] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const [businesses, setBusinesses] = useState([]);  // for super admin
  const [businessId, setBusinessId] = useState(null);  // selected business
  


  const [receiptFormat, setReceiptFormat] = useState("80mm"); // default

  const getGrossAmount = (item) => (item.quantity ?? 0) * (item.sellingPrice ?? 0);

  const getNetAmount = (item) => getGrossAmount(item) - (item.discount ?? 0);

  
  /* ===============================
     Total
  ================================ */
  const grossTotal = saleItems.reduce(
    (acc, item) => acc + getGrossAmount(item),
    0
  );

  const totalDiscount = saleItems.reduce(
    (acc, item) => acc + (item.discount || 0),
    0
  );

  const netTotal = saleItems.reduce(
    (acc, item) => acc + getNetAmount(item),
    0
  );


  
  const [amountPaid, setAmountPaid] = useState(0);

  // ✅ Always keep amountPaid equal to netTotal (POSCard behavior)
  useEffect(() => {
    setAmountPaid(netTotal);
  }, [netTotal]);

  const [productSearch, setProductSearch] = useState({});
  const [activeSearchRow, setActiveSearchRow] = useState(null);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  
  

  const parseNumber = (value) => Number(value?.toString().replace(/,/g, "")) || 0;





  /* ===============================
     Currency Formatter
  ================================ */
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-NG");
  };




  const handlePrintPreview = () => {
    // Build a temporary invoice object
    const tempInvoice = "PREVIEW"; // just a placeholder
    handlePrintReceipt(tempInvoice);
  };


  /* ===============================
     Fetch data on mount
  ================================ */
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(`${API_BASE_URL}/stock/products/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setProducts(res.data))
      .catch(console.error);

    axios.get(`${API_BASE_URL}/bank/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setBanks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBanks([]));

    // ✅ FETCH BUSINESSES (LIKE POSCARD)
    const currentUserRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");

    if (currentUserRoles.includes("super_admin")) {
      axios.get(`${API_BASE_URL}/business/simple`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setBusinesses(res.data))
        .catch(() => setBusinesses([]));
    }

    setInvoiceDate(new Date().toISOString().split("T")[0]);
  }, []);



  useEffect(() => {
  const closeDropdown = () => setActiveSearchRow(null);
  document.addEventListener("click", closeDropdown);
  return () => document.removeEventListener("click", closeDropdown);
}, []);



  const getFilteredProducts = (rowIndex) => {
    const search = productSearch[rowIndex] || "";
    if (!search.trim()) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  

  

  /* ===============================
     Add / Update / Remove Items
  ================================ */
  const addItem = () => {
    setSaleItems([
      ...saleItems,
      { productId: "", quantity: 1, sellingPrice: 0, discount: 0 },
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
    Reset Form
  =============================== */
  const resetForm = () => {
    // Reset everything except invoice
    setSaleItems([{ productId: "", quantity: 1, sellingPrice: 0 }]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod(""); // ✅ reset to blank
    setBankId("");
    setRefNo("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
  };


  

  /* ===============================
     Print Receipt
  ================================ */
  const handlePrintReceipt = (invoice) => {
    const receiptData = {
      SHOP_NAME,
      invoice,
      invoiceDate,
      customerName,
      customerPhone,
      refNo,
      paymentMethod,
      amountPaid,

      grossTotal,
      totalDiscount,
      netTotal,

      balance: netTotal - amountPaid,

      items: saleItems.map(item => {
        const product = products.find(p => p.id === Number(item.productId));
        return {
          product_name: product?.name || "",
          quantity: item.quantity,
          selling_price: item.sellingPrice,
          gross_amount: getGrossAmount(item),
          discount: item.discount || 0,
          net_amount: getNetAmount(item),
        };
      }),

      amountInWords: numberToWords(netTotal),
      formatCurrency
    };


    // ✅ Use the selected format dynamically
    printReceipt(receiptFormat, receiptData);
  };



const validateSale = () => {
  if (!saleItems.length) {
    alert("Add at least one product");
    return false;
  }

  for (let i = 0; i < saleItems.length; i++) {
    const item = saleItems[i];

    // ✅ Product
    if (!item.productId) {
      alert(`Product not selected on row ${i + 1}`);
      return false;
    }

    // ✅ Quantity
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      alert(`Invalid quantity on row ${i + 1}`);
      return false;
    }

    // ✅ Selling price
    if (!Number.isFinite(item.sellingPrice) || item.sellingPrice <= 0) {
      alert(`Invalid selling price on row ${i + 1}`);
      return false;
    }

    // ✅ Discount
    const discount = Number(item.discount) || 0;
    const gross = item.quantity * item.sellingPrice;

    if (discount < 0) {
      alert(`Discount cannot be negative on row ${i + 1}`);
      return false;
    }

    if (discount > gross) {
      alert(`Discount exceeds item total on row ${i + 1}`);
      return false;
    }
  }

  // ✅ Net total must be positive
  if (!Number.isFinite(netTotal) || netTotal <= 0) {
    alert("Net total must be greater than zero");
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

  // ✅ SUPER ADMIN MUST SELECT BUSINESS
  if (businesses.length > 0 && !businessId) {
    return alert("Please select a business");
  }

  if (!paymentMethod) {
    return alert("Select payment method");
  }

  if (amountPaid < 0) {
    return alert("Amount cannot be negative");
  }

  if (paymentMethod !== "cash" && !bankId) {
    return alert("Please select a bank");
  }

  const token = localStorage.getItem("token");

  try {
    const salePayload = {
      invoice_date: invoiceDate,
      customer_name: customerName.trim() || "Walk-in",
      customer_phone: customerPhone.trim() || null,
      ref_no: refNo.trim() || null,
      items: saleItems.map(item => ({
        product_id: Number(item.productId),
        quantity: item.quantity,
        selling_price: item.sellingPrice,
        discount: item.discount || 0,
      })),
      // ✅ EXACTLY LIKE POSCARD
      ...(businessId && { business_id: businessId }),
    };

    const saleRes = await axios.post(
      `${API_BASE_URL}/sales/`,
      salePayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const invoice = saleRes.data.invoice_no;
    setInvoiceNo(invoice);

    // ✅ USE invoice VARIABLE (NOT invoiceNo STATE)
    if (amountPaid > 0) {
      const paymentPayload = {
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        ...(paymentMethod !== "cash" && { bank_id: bankId }),
      };

      await axios.post(
        `${API_BASE_URL}/payments/${invoice}/payments`,
        paymentPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    handlePrintReceipt(invoice);

    alert("Sale completed successfully");

    resetForm();
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
    <div
      className="pos-sales-container"
      onKeyDown={(e) => {
        e.stopPropagation(); // 🔴 POS owns keyboard
      }}
    >

  {/* Header */}
  <div className="pos-header">
    <h2 className="pos-heading">POS Sales Entry</h2>

    <div className="pos-header-actions">
      {/* Receipt format selector */}
      <select
        className="receipt-format-select"
        value={receiptFormat}
        onChange={(e) => setReceiptFormat(e.target.value)}
        title="Receipt Format"
      >
        <option value="80mm">80mm Print</option>
        <option value="A4">A4 Print</option>
      </select>

      {/* Close button */}
      <button
        type="button"
        className="pos-close-btn"
        onClick={() => window.close()}
      >
        ✕
      </button>
    </div>
  </div>




  {/* Scrollable Form Area */}
  <div className="pos-scrollable-content">
    {/* Top Info */}
    <div className="pos-meta-grid">
      <div className="input-group">

        {businesses.length > 0 && (
            <div className="input-group">
              <label>Business</label>
              <select
                value={businessId || ""}
                onChange={(e) => setBusinessId(Number(e.target.value))}
              >
                <option value="">-- Select Business --</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
          <th>Gross</th>
          <th>Discount</th>
          <th>Net</th>
          <th>Action</th>

        </tr>
      </thead>
      <tbody>

        
        {saleItems.map((item, index) => (
          <tr key={index}>
            <td>
              <div
                className="product-search-wrapper"
                onClick={(e) => e.stopPropagation()}
              >

                <input
                  type="text"
                  placeholder="Search product..."
                  value={
                    activeSearchRow === index
                      ? productSearch[index] || ""
                      : products.find(p => p.id === Number(item.productId))?.name || ""
                  }
                  onFocus={() => {
                    setActiveSearchRow(index);
                    setProductSearch({ ...productSearch, [index]: "" });
                  }}
                  onChange={(e) => {
                    setProductSearch({
                      ...productSearch,
                      [index]: e.target.value,
                    });
                    setHighlightedIndex(-1);
                  }}

                  onKeyDown={(e) => {
                    e.stopPropagation(); // ✅ block dashboard/global shortcuts

                    const filtered = getFilteredProducts(index);
                    if (!filtered.length) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault(); // ⛔ prevent cursor move
                      setHighlightedIndex((prev) =>
                        prev < filtered.length - 1 ? prev + 1 : 0
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault(); // ⛔ prevent cursor move
                      setHighlightedIndex((prev) =>
                        prev > 0 ? prev - 1 : filtered.length - 1
                      );
                    }

                    if (e.key === "Enter" && highlightedIndex >= 0) {
                      e.preventDefault(); // ⛔ prevent form submit
                      const selected = filtered[highlightedIndex];
                      updateItem(index, "productId", selected.id);
                      setActiveSearchRow(null);
                      setHighlightedIndex(-1);
                    }
                  }}




                  className="product-search-input"
                />



                {activeSearchRow === index && (
                  <div className="product-search-dropdown">

                  {/* 🔢 MATCH COUNT — PLACE IT HERE */}
                  <div className="product-search-count">
                    {getFilteredProducts(index).length} items found
                  </div>

                  {/* 📦 PRODUCT LIST */}
                  {getFilteredProducts(index).map((p, i) => (
                    <div
                      key={p.id}
                      className={`product-search-item ${
                        i === highlightedIndex ? "active" : ""
                      }`}
                      onClick={() => {
                        updateItem(index, "productId", p.id);
                        setActiveSearchRow(null);
                        setHighlightedIndex(-1);
                      }}
                    >
                      {p.name}
                    </div>
                  ))}


                  {/* ❌ EMPTY STATE */}
                  {getFilteredProducts(index).length === 0 && (
                    <div className="product-search-empty">No product found</div>
                  )}

                </div>

                )}
              </div>
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
                type="text"
                inputMode="numeric"
                value={(item.sellingPrice ?? 0).toLocaleString("en-NG")}
                onChange={(e) => {
                  const raw = parseNumber(e.target.value); // remove commas
                  updateItem(index, "sellingPrice", raw);  // update state with raw number
                }}
                onFocus={(e) => {
                  e.target.select(); // optional: select all text on focus
                }}
              />

            </td>
            <td>{formatCurrency(getGrossAmount(item))}</td>

            <td>
              <input
                type="text"
                inputMode="numeric"
                value={(item.discount ?? 0).toLocaleString("en-NG")}
                onChange={(e) => {
                  const raw = parseNumber(e.target.value);
                  updateItem(index, "discount", raw);
                }}
                onFocus={(e) => e.target.select()}
              />
            </td>
            <td className="net-amount">
              {formatCurrency(getNetAmount(item))}
            </td>


            <td>
              <button className="remove-btn" onClick={() => removeItem(index)}>Remove</button>
            </td>
          </tr>
        ))}
       <tr className="add-product-summary-row">
        {/* Add product button — stays at the beginning */}
        <td className="add-product-row">
          <button className="add-btn" onClick={addItem}>
            + Add Product
          </button>
        </td>

        {/* Empty cells */}
        <td colSpan="4"></td>

        {/* 🔢 NET TOTAL — Net column */}
        <td className="gross-total-cell">
          <span className="gross-total-inline">
            Net Total {formatCurrency(netTotal)}
          </span>
        </td>

        {/* 💳 PAY NOW — Action column */}
        <td className="action-pay-cell"></td>

      </tr>



      </tbody>
    </table>

    

    
    
    
      {/* Pay Now, Payment & Balance */}
      <div className="pay-area">
        <div className="pay-balance-container">
          <div className="pay-now-wrapper">
            
              <div className="payment-card">

                <div className="payment-title">Payment</div>

                <div className="payment-row compact">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={amountPaid.toLocaleString("en-NG")}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/,/g, ""));
                      setAmountPaid(value);
                    }}
                  />
                </div>

                <div className="payment-row compact">
                  <label>Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const method = e.target.value;
                      setPaymentMethod(method);
                      setShowBankDropdown(method !== "cash");
                      if (method === "cash") setBankId("");
                    }}
                  >
                    <option value="">-- Select --</option>
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
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="complete-sale-container payment-complete">
                  <button className="preview-btn" onClick={handlePrintPreview}>
                    Print Preview
                  </button>
                  <button className="submit-btn" onClick={handleSubmit}>
                    Complete Sale
                  </button>
                </div>
              </div>
            
          </div>

          {/* Balance */}
          <div className="balance-wrapper">

              <label>Balance</label>
              <strong>{formatCurrency(netTotal - amountPaid)}</strong>
            </div>
          
        </div>
      </div>

      </div> {/* End scrollable content */}
    </div>
  );
};

export default PosSales;
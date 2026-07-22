import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PosSales.css";
import { numberToWords } from "../../utils/numberToWords";

import { printReceipt } from "../../components/pos/printReceipt";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${window.location.hostname}:8000`;


const PosSales = ({ onClose }) => {

  const createEmptyRow = () => ({
    barcode: "",
    productId: "",
    quantity: 1,
    sellingPrice: 0,
    discount: 0
  });


  const [saleItems, setSaleItems] = useState(
    Array.from({ length: 6 }, createEmptyRow)
  );

  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankId, setBankId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [refNo, setRefNo] = useState("");

  const [businesses, setBusinesses] = useState([]);  
  const [businessId, setBusinessId] = useState(null);  

  const [receiptFormat, setReceiptFormat] = useState("80mm");

  // ==================== NEW STATES ====================
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountEdited, setAmountEdited] = useState(false);
  // ====================================================

  const getGrossAmount = (item) => (item.quantity ?? 0) * (item.sellingPrice ?? 0);
  const getNetAmount = (item) => getGrossAmount(item) - (item.discount ?? 0);

  const validItems = saleItems.filter(item => item.productId);

  /* ===============================
     Total
  ================================ */
  const grossTotal = validItems.reduce(
    (acc, item) => acc + getGrossAmount(item),
    0
  );

  const totalDiscount = validItems.reduce(
    (acc, item) => acc + (item.discount || 0),
    0
  );

  const netTotal = validItems.reduce(
    (acc, item) => acc + getNetAmount(item),
    0
  );

  /* ===============================
     Auto Sync Amount Paid with Net Total
     (Same behavior as POSCardPage)
  =============================== */
  useEffect(() => {
    if (validItems.length === 0) {
      setAmountPaid(0);
      setAmountEdited(false);
      return;
    }

    if (!amountEdited) {
      setAmountPaid(netTotal);
    }
  }, [netTotal, amountEdited, validItems.length]);

  // Clear payment method when amount becomes zero
  useEffect(() => {
    if (amountPaid === 0) {
      setPaymentMethod("");
      setBankId("");
    }
  }, [amountPaid]);

  const [productSearch, setProductSearch] = useState({});
  const [activeSearchRow, setActiveSearchRow] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const parseNumber = (value) => Number(value?.toString().replace(/,/g, "")) || 0;

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-NG");
  };

  const handlePrintPreview = () => {
    const tempInvoice = "PREVIEW";
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

  // ... (All your existing functions: handleBarcodeScan, getFilteredProducts, addItem, updateItem, removeItem remain unchanged) ...

  const handleBarcodeScan = async (rowIndex, barcodeValue) => {
    // ... your existing handleBarcodeScan code (unchanged) ...
    if (!barcodeValue || barcodeValue.length < 4) return;

    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/stock/products/scan/${barcodeValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { business_id: businessId || undefined },
        }
      );

      const product = res.data;
      const newItems = [...saleItems];

      const existingIndex = newItems.findIndex(
        (item, i) =>
          i !== rowIndex && Number(item.productId) === Number(product.id)
      );

      if (existingIndex !== -1) {
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: (newItems[existingIndex].quantity || 0) + 1,
        };
        newItems[rowIndex] = createEmptyRow();
        setSaleItems(newItems);
        return;
      }

      newItems[rowIndex] = {
        ...newItems[rowIndex],
        barcode: product.barcode,
        productId: product.id,
        sellingPrice: product.selling_price || 0,
        quantity: 1,
      };

      setSaleItems(newItems);

      const nextRow = rowIndex + 1;
      if (nextRow >= newItems.length) {
        setSaleItems([...newItems, createEmptyRow()]);
      }

    } catch (err) {
      console.error("Scan failed", err);
      const newItems = [...saleItems];
      newItems[rowIndex] = {
        ...newItems[rowIndex],
        productId: "",
        sellingPrice: 0,
      };
      setSaleItems(newItems);

      if (!newItems[rowIndex].barcodeErrorShown) {
        alert("Product not found for scanned barcode");
        newItems[rowIndex].barcodeErrorShown = true;
        setSaleItems([...newItems]);
      }
    }
  };

  const getFilteredProducts = (rowIndex) => {
    const search = productSearch[rowIndex] || "";
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const addItem = () => {
    setSaleItems([...saleItems, createEmptyRow()]);
  };

  const updateItem = (index, key, value) => {
    const newItems = [...saleItems];
    newItems[index][key] = value;

    if (key === "productId") {
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        newItems[index].sellingPrice = product.selling_price || 0;
        newItems[index].barcode = product.barcode || "";
      } else {
        newItems[index].sellingPrice = 0;
        newItems[index].barcode = "";
      }
    }

    setSaleItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...saleItems];
    newItems.splice(index, 1);
    setSaleItems(newItems);
  };

  const resetForm = () => {
    setSaleItems(Array.from({ length: 6 }, createEmptyRow));
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("");
    setBankId("");
    setRefNo("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setAmountPaid(0);          // Added
    setAmountEdited(false);    // Added
  };

  const handlePrintReceipt = (invoice) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const business = storedUser.business;

    if (!business || !business.name) {
      alert("Business information missing. Please login again.");
      return;
    }

    const receiptData = {
      RECEIPT_NAME: business.name,
      BUSINESS_ADDRESS: business.address || "",
      BUSINESS_PHONE: business.phone || "",
      BUSINESS_LOGO: business.logo || "",

      invoice,
      invoiceDate,
      customerName: customerName || "-",
      customerPhone: customerPhone || "-",
      refNo: refNo || "-",
      paymentMethod: paymentMethod || "-",
      amountPaid: amountPaid || 0,
      grossTotal: grossTotal || 0,
      totalDiscount: totalDiscount || 0,
      netTotal: netTotal || 0,
      balance: (netTotal || 0) - (amountPaid || 0),

      items: saleItems
        .filter(item => item.productId)
        .map(item => {
          const product = products.find(p => Number(p.id) === Number(item.productId));
          return {
            product_name: product?.name || "-",
            quantity: item.quantity || 0,
            selling_price: item.sellingPrice || 0,
            gross_amount: getGrossAmount(item) || 0,
            discount: item.discount || 0,
            net_amount: getNetAmount(item) || 0,
          };
        }),

      amountInWords: numberToWords(netTotal || 0),
    };

    printReceipt(receiptFormat, receiptData);
  };

  const validateSale = () => {
    const validItems = saleItems.filter(item => item.productId);

    if (!validItems.length) {
      alert("Add at least one product");
      return false;
    }

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        alert(`Invalid quantity on row ${i + 1}`);
        return false;
      }

      if (!Number.isFinite(item.sellingPrice) || item.sellingPrice <= 0) {
        alert(`Invalid selling price on row ${i + 1}`);
        return false;
      }

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

    if (!Number.isFinite(netTotal) || netTotal <= 0) {
      alert("Net total must be greater than zero");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSale()) return;

    if (businesses.length > 0 && !businessId) {
      return alert("Please select a business");
    }

    if (amountPaid < 0) {
      return alert("Amount cannot be negative");
    }

    if (amountPaid > 0) {
      if (!paymentMethod) {
        return alert("Select payment method");
      }
      if (paymentMethod !== "cash" && !bankId) {
        return alert("Please select a bank");
      }
    }

    const token = localStorage.getItem("token");

    try {
      const salePayload = {
        invoice_date: invoiceDate,
        customer_name: customerName.trim() || "Walk-in",
        customer_phone: customerPhone.trim() || null,
        ref_no: refNo.trim() || null,
        items: saleItems
          .filter(item => item.productId)
          .map(item => ({
            product_id: Number(item.productId),
            quantity: item.quantity,
            selling_price: item.sellingPrice,
            discount: item.discount || 0,
          })),
        ...(businessId && { business_id: businessId }),
      };

      const saleRes = await axios.post(
        `${API_BASE_URL}/sales/`,
        salePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const invoice = saleRes.data.invoice_no;
      setInvoiceNo(invoice);

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
      setAmountEdited(false);   // Reset edited flag
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
    <div className="pos-sales-container" onKeyDown={(e) => e.stopPropagation()}>

      {/* Header - unchanged */}
      <div className="pos-header">
        <h2 className="pos-heading">POS Sales Entry</h2>
        <div className="pos-header-actions">
          <select
            className="receipt-format-select"
            value={receiptFormat}
            onChange={(e) => setReceiptFormat(e.target.value)}
          >
            <option value="80mm">80mm Print</option>
            <option value="A4">A4 Print</option>
          </select>
          <button className="pos-close-btn" onClick={() => window.close()}>
            ✕
          </button>
        </div>
      </div>

      <div className="pos-scrollable-content">
        {/* Top Info - unchanged */}
        <div className="pos-meta-grid">
          {/* ... your existing meta fields (Business, Customer, etc.) ... */}
          {businesses.length > 0 && (
            <div className="input-group">
              <label>Business</label>
              <select value={businessId || ""} onChange={(e) => setBusinessId(Number(e.target.value))}>
                <option value="">-- Select Business --</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

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

        {/* Table - unchanged */}
        <table className="pos-sales-table">
          {/* ... entire table remains exactly the same ... */}
          <thead>
            <tr>
              <th>Barcode</th>
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
                {/* All your table rows (barcode, product search, qty, price, etc.) remain unchanged */}
                {/* ... (your full row code) ... */}
                <td>
                  <input
                    type="text"
                    placeholder="Scan barcode..."
                    value={item.barcode || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newItems = [...saleItems];
                      newItems[index].barcode = value;
                      newItems[index].barcodeErrorShown = false;
                      setSaleItems(newItems);

                      if (value.length >= 6) {
                        clearTimeout(newItems[index].barcodeTimer);
                        newItems[index].barcodeTimer = setTimeout(() => {
                          handleBarcodeScan(index, value.trim());
                        }, 300);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const barcodeValue = e.target.value.trim();
                        if (barcodeValue.length < 6) return;
                        handleBarcodeScan(index, barcodeValue);
                      }
                    }}
                  />
                </td>

                <td>
                  <div className="product-search-wrapper" onClick={(e) => e.stopPropagation()}>
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
                        setProductSearch({ ...productSearch, [index]: e.target.value });
                        setHighlightedIndex(-1);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        const filtered = getFilteredProducts(index);
                        if (!filtered.length) return;

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedIndex((prev) => prev < filtered.length - 1 ? prev + 1 : 0);
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndex((prev) => prev > 0 ? prev - 1 : filtered.length - 1);
                        }
                        if (e.key === "Enter" && highlightedIndex >= 0) {
                          e.preventDefault();
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
                        <div className="product-search-count">
                          {getFilteredProducts(index).length} items found
                        </div>
                        {getFilteredProducts(index).map((p, i) => (
                          <div
                            key={p.id}
                            className={`product-search-item ${i === highlightedIndex ? "active" : ""}`}
                            onClick={() => {
                              updateItem(index, "productId", p.id);
                              setActiveSearchRow(null);
                              setHighlightedIndex(-1);
                            }}
                          >
                            {p.name}
                          </div>
                        ))}
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
                      const raw = parseNumber(e.target.value);
                      updateItem(index, "sellingPrice", raw);
                    }}
                    onFocus={(e) => e.target.select()}
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
              <td className="add-product-row">
                <button className="add-btn" onClick={addItem}>+ Add Product</button>
              </td>
              <td colSpan="5"></td>
              <td className="gross-total-cell">
                <span className="gross-total-inline">
                  Net Total {formatCurrency(netTotal)}
                </span>
              </td>
              <td className="action-pay-cell"></td>
            </tr>
          </tbody>
        </table>

        {/* Payment Section - Updated Amount Input */}
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
                      const value = Number(e.target.value.replace(/,/g, "")) || 0;
                      setAmountEdited(true);        // ← Key change
                      setAmountPaid(value);
                    }}
                  />
                </div>

                <div className="payment-row compact">
                  <label>Method</label>
                  <select
                    value={paymentMethod}
                    disabled={amountPaid === 0}
                    onChange={(e) => {
                      const method = e.target.value;
                      setPaymentMethod(method);
                      if (method === "cash") setBankId("");
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                    <option value="pos">POS</option>
                  </select>
                </div>

                {amountPaid > 0 && paymentMethod !== "cash" && (
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
                    🖨️ Print Receipt
                  </button>
                </div>
              </div>
            </div>

            <div className="balance-wrapper">
              <label>Balance</label>
              <strong>{formatCurrency(netTotal - amountPaid)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosSales;
import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./POSCardPage.css";
import { numberToWords } from "../../utils/numberToWords";


import { printReceipt } from "../../components/pos/printReceipt";
import { SHOP_NAME } from "../../config/constants";





const Calculator = () => {
  const [display, setDisplay] = useState("");

  const handleClick = (value) => {
    if (value === "C") return setDisplay("");
    if (value === "<") return setDisplay((prev) => prev.slice(0, -1));
    if (value === "=") {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(eval(display).toString());
      } catch {
        setDisplay("Error");
      }
      return;
    }
    setDisplay((prev) => prev + value);
  };

  const buttons = [
    "C", "<", "/", "*",
    "7", "8", "9", "+",
    "4", "5", "6", "-",
    "1", "2", "3", "=",
    "0", "00", "%", "."
  ];

  return (
    <div className="calculator" style={{ width: 360, height: 300, display: "flex", flexDirection: "column", padding: "2px", boxSizing: "border-box" }}>
      <input
        className="calc-display"
        type="text"
        value={display}
        readOnly
        style={{
          width: "100%",
          height: "60px",
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "right",
          marginBottom: "10px",
          paddingRight: "10px",
          boxSizing: "border-box",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <div className="calc-buttons" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridGap: "10px", flexGrow: 1 }}>
        {buttons.map((b, idx) => (
          <button key={idx} onClick={() => handleClick(b)} className={b === "=" ? "equal-btn" : ""} style={{ fontSize: "28px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", padding: "5px" }}>
            {b}
          </button>
        ))}
      </div>
    </div>
  );
};

const POSCardPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountEdited, setAmountEdited] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bankId, setBankId] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [banks, setBanks] = useState([]);


  const [totalPaid, setTotalPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");


  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [refNo, setRefNo] = useState("");

  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const [receiptFormat, setReceiptFormat] = useState("80mm");

  
  
  // =========================
    //  🔹 ADD THESE STATES FOR REPRINT
    // =========================
  const [reprintMode, setReprintMode] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const loadInvoiceByIndex = async (index) => {
  if (!invoiceList.length || index < 0 || index >= invoiceList.length) return;

  const token = localStorage.getItem("token");
  const invoiceNo = invoiceList[index];

  try {
    const res = await axiosWithAuth(token).get(`/sales/receipt/${invoiceNo}`)

    const sale = res.data;

    setCurrentInvoice(invoiceNo);
    setCartItems(sale.items.map(i => ({
      id: i.product_id,
      name: i.product_name,
      qty: i.quantity,
      selling_price: i.selling_price,
      discount: i.discount || 0,
    })));

    setCustomerName(sale.customer_name || "");
    setCustomerPhone(sale.customer_phone || "");
    setRefNo(sale.ref_no || "");
    setAmountPaid(sale.amount_paid);
    setPaymentMethod(sale.payment_method);
    setBankId(sale.bank_id || "");
    
    setReprintMode(true);
    setCurrentInvoiceIndex(index);
  } catch {
    alert("Failed to load invoice");
  }
};

  // ◀ and ▶ buttons
  const loadPrevInvoice = () => {
    if (currentInvoiceIndex > 0) {
      handleLoadInvoice(invoiceList[currentInvoiceIndex - 1]);
    }
  };

  const loadNextInvoice = () => {
    if (currentInvoiceIndex < invoiceList.length - 1) {
      handleLoadInvoice(invoiceList[currentInvoiceIndex + 1]);
    }
  };



  // ❌ Exit reprint mode and return to normal sales
  const exitReprintMode = () => {
    setReprintMode(false);
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setRefNo("");
    setAmountPaid(0);
    setPaymentMethod("cash");
    setBankId("");
    setCurrentInvoice(null);
    setCurrentInvoiceIndex(0); // ✅ add this
  };

  

  const EMPTY_ROWS = 10;


  
const handleLoadInvoice = async (invoiceNo) => {
  setLoadingInvoice(true);
  const token = localStorage.getItem("token");

  try {
    const res = await axiosWithAuth(token).get(`/sales/receipt/${invoiceNo}`);
    const sale = res.data;

    setCurrentInvoice(invoiceNo);

    // ✅ Items
    setCartItems(
      sale.items.map((i) => ({
        id: i.product_id,
        name: i.product_name,
        qty: i.quantity,
        selling_price: i.selling_price,
        discount: i.discount || 0,
      }))
    );

    // ✅ Customer
    setCustomerName(sale.customer_name || "");
    setCustomerPhone(sale.customer_phone || "");
    setRefNo(sale.ref_no || "");

    // ✅ PAYMENT — FROM BACKEND
    setAmountPaid(sale.total_paid || 0);
    setTotalPaid(sale.total_paid || 0);
    setBalanceDue(sale.balance_due || 0);
    setPaymentStatus(sale.payment_status || "");

    setPaymentMethod("cash"); // optional (receipt only)
    setBankId("");

    setReprintMode(true);

    const index = invoiceList.findIndex((inv) => inv === invoiceNo);
    if (index !== -1) setCurrentInvoiceIndex(index);

  } catch (err) {
    console.error(err);
    alert("Failed to load receipt");
  } finally {
    setLoadingInvoice(false);
  }
};




  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setInvoiceList([]);

        const res = await axiosWithAuth(token).get("/sales/invoices");

        // 🔥 Normalize: only keep invoice numbers
        const invoices = Array.isArray(res.data)
          ? res.data.map(i => i.invoice_no ?? i)
          : [];

        // Sort ascending for better navigation
        invoices.sort((a, b) => a - b);

        setInvoiceList(invoices);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setInvoiceList([]);
      }
    };

    fetchInvoices();
  }, []);






  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    axiosWithAuth(token)
      .get("/stock/category/simple")
      .then((res) => setCategories(res.data))
      .catch(() => alert("Failed to load categories"));

    axiosWithAuth(token)
      .get("/stock/products/simple-pos")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"));

    axiosWithAuth(token)
      .get("/bank/simple")
      .then((res) => setBanks(res.data))
      .catch(() => setBanks([]));
  }, []);

  // =========================
  // CART LOGIC
  // =========================
  const addItemToCart = (item) => {
    if (reprintMode) return; // 🔒 block edits during reprint

    setCartItems((prev) => {
      const found = prev.find((i) => i.id === item.id);

      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          selling_price: item.selling_price,
          qty: 1,
          discount: 0,
        },
      ];
    });

    // ✅ AUTO OPEN PAYMENT SESSION (only when cart was empty)
    setTimeout(() => {
      setPaymentMethod("cash");
      setShowBankDropdown(false);
      setBankId("");
      setAmountEdited(false);
    }, 0);
  };



  const updateQty = (id, qty) => {
    if (qty <= 0) return;
    setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };
  const updatePrice = (id, price) => setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, selling_price: price } : i));
  const updateDiscount = (id, discount) => setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, discount } : i));
  const removeItem = (id) => setCartItems((prev) => prev.filter((i) => i.id !== id));

  // =========================
  // TOTALS
  // =========================
  const grossTotal = cartItems.reduce((sum, i) => sum + (i.qty || 0) * (i.selling_price || 0), 0);
  const totalDiscount = cartItems.reduce((sum, i) => sum + (i.discount || 0), 0);
  const netTotal = grossTotal - totalDiscount;

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_name === activeCategory.name)
    : [];

  // =========================
  // SYNC PAYMENT
  // =========================
  useEffect(() => {
    if (reprintMode) return; // 🔒 DO NOT touch payment in reprint

    if (cartItems.length > 0 && !amountEdited) {
      setAmountPaid(netTotal);
    }

    if (cartItems.length === 0) {
      setAmountPaid(0);
      setAmountEdited(false);
    }
  }, [netTotal, cartItems.length, amountEdited, reprintMode]);







  const handlePrintReceipt = (invoiceNo) => {
    const receiptData = {
      SHOP_NAME,
      invoice: invoiceNo,
      invoiceDate: new Date().toISOString().split("T")[0],
      customerName,
      customerPhone,
      refNo,
      paymentMethod,

      grossTotal,
      totalDiscount,
      netTotal,

      amountPaid: reprintMode ? totalPaid : amountPaid,
      balance: reprintMode ? balanceDue : netTotal - amountPaid,

      items: cartItems.map((i) => ({
        product_name: i.name,
        quantity: i.qty,
        selling_price: i.selling_price,
        gross_amount: i.qty * i.selling_price,
        discount: i.discount || 0,
        net_amount: i.qty * i.selling_price - (i.discount || 0),
      })),

      formatCurrency: (amount) =>
        `₦${Number(amount || 0).toLocaleString("en-NG")}`,

      amountInWords: numberToWords(netTotal),
    };

    printReceipt(receiptFormat, receiptData);
  };



  // =========================
  // SUBMIT SALE
  // =========================
  const handleSubmit = async () => {
    if (!cartItems.length) return alert("Cart is empty");
    if (!paymentMethod) return alert("Select payment method");
    if (amountPaid <= 0) return alert("Invalid amount");
    if (paymentMethod !== "cash" && !bankId) return alert("Please select a bank");

    const token = localStorage.getItem("token");

    try {
      const salePayload = {
        invoice_date: new Date().toISOString().split("T")[0],
        customer_name: customerName || "Walk-in",
        customer_phone: customerPhone || null,
        ref_no: refNo || null,
        items: cartItems.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
          selling_price: i.selling_price,
          discount: i.discount || 0,
        })),
      };

      const saleRes = await axiosWithAuth(token).post("/sales/", salePayload);
      const invoiceNo = saleRes.data.invoice_no;

      const paymentPayload = {
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        ...(paymentMethod !== "cash" && { bank_id: bankId }),
      };

      await axiosWithAuth(token).post(`/payments/sale/${invoiceNo}`, paymentPayload);

      handlePrintReceipt(invoiceNo);

      alert("Sale completed successfully");

      // ✅ RESET EVERYTHING
      setCartItems([]);
      setAmountPaid(0);
      setAmountEdited(false);

      
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) alert(detail.map(d => d.msg).join("\n"));
      else alert(detail || "Transaction failed");
    }
  };

  return (
    <div className="poscard-container">
      {/* TOP */}
      <div className="poscard-top">
        <div className="poscard-cart">

          {/* HEADER */}
          <div className="cart-header">
            <div
              className={`sales-header-left ${
                reprintMode ? "reprint-header" : ""
              }`}
            >
              <button
                title="Reprint"
                onClick={() => {
                  if (!invoiceList.length) {
                    alert("No invoices available");
                    return;
                  }
                  const lastInvoiceNo =
                    invoiceList[invoiceList.length - 1];
                  handleLoadInvoice(lastInvoiceNo);
                }}
              >
                ⟷
              </button>

              <h2>{reprintMode ? "Reprint" : "Sales"}</h2>

              {reprintMode && (
                <div className="invoice-nav">
                  <button
                    onClick={loadPrevInvoice}
                    disabled={currentInvoiceIndex === 0}
                  >
                    ◀
                  </button>

                  <span className="reprint-invoice">
                    Invoice #{currentInvoice}
                  </span>

                  <button
                    onClick={loadNextInvoice}
                    disabled={
                      currentInvoiceIndex === invoiceList.length - 1
                    }
                  >
                    ▶
                  </button>

                  <button
                    className="exit-reprint"
                    onClick={exitReprintMode}
                  >
                    ✖ Exit
                  </button>
                </div>
              )}

              {/* PRINT FORMAT — ALWAYS ENABLED */}
              <div className="print-format-inline">
                <label>Print</label>
                <select
                  value={receiptFormat}
                  onChange={(e) => setReceiptFormat(e.target.value)}
                >
                  <option value="80mm">80mm</option>
                  <option value="A4">A4</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={reprintMode}
              />

              <input
                type="text"
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={reprintMode}
              />

              <input
                type="text"
                placeholder="Ref No"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                disabled={reprintMode}
              />
            </div>

            <button onClick={() => navigate("/dashboard")}>
              Exit
            </button>
          </div>



          {/* TABLE HEADER */}
          <div className="cart-grid header extended">
            <div>Item</div>
            <div>Qty</div>
            <div>Price</div>
            <div>Gross</div>
            <div>Discount</div>
            <div>Net</div>
            <div>X</div>
          </div>

          {/* CART ITEMS */}
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => {
                const gross = (item.qty || 0) * (item.selling_price || 0);
                const net = gross - (item.discount || 0);

                return (
                  <div
                    key={item.id}
                    className={`cart-grid row ${index % 2 === 0 ? "even" : "odd"}`}
                  >
                    <div className="cell item-name">{item.name}</div>

                    <div className="cell">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        disabled={reprintMode}
                        onChange={(e) =>
                          updateQty(item.id, Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="cell">
                      <input
                        type="text"
                        value={(item.selling_price || 0).toLocaleString()}
                        disabled={reprintMode}
                        onChange={(e) =>
                          updatePrice(
                            item.id,
                            Number(e.target.value.replace(/,/g, ""))
                          )
                        }
                      />
                    </div>

                    <div className="cell">{gross.toLocaleString()}</div>

                    <div className="cell">
                      <input
                        type="text"
                        value={(item.discount || 0).toLocaleString()}
                        disabled={reprintMode}
                        onChange={(e) =>
                          updateDiscount(
                            item.id,
                            Number(e.target.value.replace(/,/g, ""))
                          )
                        }
                      />
                    </div>

                    <div className="cell net-cell">
                      {net.toLocaleString()}
                    </div>

                    <div className="cell action-cell">
                      {!reprintMode && (
                        <button onClick={() => removeItem(item.id)}>X</button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              Array.from({ length: EMPTY_ROWS }).map((_, i) => (
                <div
                  key={i}
                  className={`cart-grid row ${i % 2 === 0 ? "even" : "odd"}`}
                >
                  <div className="cell item-name"></div>
                  <div className="cell"></div>
                  <div className="cell"></div>
                  <div className="cell"></div>
                  <div className="cell"></div>
                  <div className="cell net-cell"></div>
                  <div className="cell action-cell"></div>
                </div>
              ))
            )}
          </div>

          {/* TOTALS */}
          <div className="cart-grid total-row extended">
            <div>Total</div>
            <div></div>
            <div></div>
            <div>{grossTotal.toLocaleString()}</div>
            <div>{totalDiscount.toLocaleString()}</div>
            <div>{netTotal.toLocaleString()}</div>
          </div>

        </div>

        {/* PAYMENT + CALCULATOR */}
        <div className="poscard-right-wrapper" style={{ display: "flex", gap: "10px" }}>
          <div className="poscard-right-placeholder" style={{ width: "250px" }}>
            <div className="payment-card1" style={{ marginTop: "10px" }}>

              <div className="payment-title1">Payment</div>

              <div className="payment-row amount compact">
                <label>Amount</label>
                <input
                  type="text"
                  value={(amountPaid || 0).toLocaleString()}
                  disabled={reprintMode || cartItems.length === 0}
                  onChange={(e) => {
                    setAmountEdited(true);
                    setAmountPaid(Number(e.target.value.replace(/,/g, "")));
                  }}
                />
              </div>

              <div className="payment-row compact1">
                <label>Balance</label>
                <strong>
                  {reprintMode
                    ? balanceDue.toLocaleString()
                    : (netTotal - amountPaid).toLocaleString()}
                </strong>
              </div>

              <div className="payment-actions">
                <button
                  className={`preview-btn ${reprintMode ? "reprint-mode" : ""}`}
                  disabled={cartItems.length === 0 && !reprintMode}
                  onClick={() =>
                    handlePrintReceipt(
                      reprintMode ? currentInvoice : "PREVIEW"
                    )
                  }
                >
                  {reprintMode ? "Reprint" : "Preview"}
                </button>

                <button
                  className="complete-btn1"
                  disabled={cartItems.length === 0 || reprintMode}
                  onClick={handleSubmit}
                >
                  Complete Sale
                </button>
              </div>

            </div>
          </div>

          <div className="poscard-calculator" style={{ width: "360px" }}>
            <Calculator />
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="poscard-items">
        <div className="category-bar">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-tab ${
                activeCategory?.id === cat.id ? "active" : ""
              }`}
              onClick={() => !reprintMode && setActiveCategory(cat)}
            >
              {cat.name}
            </div>
          ))}
        </div>

        <div className="item-grid1">
          {activeCategory &&
            filteredProducts.map((item) => (
              <div
                key={item.id}
                className="item-card1"
                onClick={() => addItemToCart(item)}
              >
                <div>{item.name}</div>
                <div>{item.selling_price.toLocaleString()}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

};

export default POSCardPage;

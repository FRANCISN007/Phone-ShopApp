import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./POSCardPage.css";

const POSCardPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [showPayment, setShowPayment] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankId, setBankId] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [banks, setBanks] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [refNo, setRefNo] = useState("");


  const handlePrintPreview = () => {
    alert("Preview not implemented yet");
  };


  const EMPTY_ROWS = 10;

  // =========================
  // Fetch categories & products
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
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  const updatePrice = (id, price) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selling_price: price } : i))
    );
  };

  const updateDiscount = (id, discount) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, discount } : i))
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // =========================
  // TOTALS
  // =========================
  const grossTotal = cartItems.reduce(
    (sum, i) => sum + i.qty * i.selling_price,
    0
  );
  const totalDiscount = cartItems.reduce((sum, i) => sum + (i.discount || 0), 0);
  const netTotal = grossTotal - totalDiscount;

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_name === activeCategory.name)
    : [];



  // =========================
  // SYNC PAYMENT WITH NET TOTAL
  // =========================
  useEffect(() => {
    if (showPayment) {
      setAmountPaid(netTotal);
    }
  }, [netTotal, showPayment]);


  // =========================
  // Payment / Submit Sale
  // =========================
  const formatCurrency = (amount) =>
    `₦${Number(amount || 0).toLocaleString("en-NG")}`;

  const handleSubmit = () => {
    if (!cartItems.length) return alert("Cart is empty");
    if (!amountPaid || amountPaid <= 0) return alert("Enter valid amount");

    // TODO: Call your backend to create sale & payment
    alert(
      `Sale submitted\nNet: ${formatCurrency(netTotal)}\nPaid: ${formatCurrency(
        amountPaid
      )}\nBalance: ${formatCurrency(netTotal - amountPaid)}`
    );

    setCartItems([]);
    setShowPayment(false);
    setAmountPaid(0);
    setPaymentMethod("");
    setBankId("");
    setShowBankDropdown(false);
  };

  

  return (
    <div className="poscard-container">
      {/* ================= TOP ================= */}
      <div className="poscard-top">
        {/* ===== SALES GRID ===== */}
        <div className="poscard-cart">
          <div className="cart-header">
          <div className="sales-header-left">
            <h2>Sales</h2>

            <input
              type="text"
              placeholder="Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

            <input
              type="text"
              placeholder="Ref No"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
            />
          </div>

          <button onClick={() => navigate("/dashboard")}>Exit</button>
        </div>


          <div className="cart-grid header extended">
            <div>Item</div>
            <div>Qty</div>
            <div>Price</div>
            <div>Gross</div>
            <div>Discount</div>
            <div>Net</div>
            <div>X</div>
          </div>

          <div className="cart-items">
            {Array.from({ length: Math.max(EMPTY_ROWS, cartItems.length) }).map(
              (_, index) => {
                const item = cartItems[index];
                const gross = item ? item.qty * item.selling_price : 0;
                const net = item ? gross - (item.discount || 0) : 0;

          

                return (
                  <div
                    key={item ? item.id : `empty-${index}`}
                    className={`cart-grid row ${
                      index % 2 === 0 ? "even" : "odd"
                    }`}
                  >
                    <div className="cell item-name">{item?.name || ""}</div>
                    <div className="cell">
                      {item && (
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(item.id, Number(e.target.value))
                          }
                        />
                      )}
                    </div>
                    <div className="cell">
                      {item && (
                        <input
                          type="text"
                          value={item.selling_price.toLocaleString()}
                          onChange={(e) =>
                            updatePrice(
                              item.id,
                              Number(e.target.value.replace(/,/g, ""))
                            )
                          }
                        />
                      )}
                    </div>
                    <div className="cell">{gross.toLocaleString()}</div>
                    <div className="cell">
                      {item && (
                        <input
                          type="text"
                          value={(item.discount || 0).toLocaleString()}
                          onChange={(e) =>
                            updateDiscount(
                              item.id,
                              Number(e.target.value.replace(/,/g, ""))
                            )
                          }
                        />
                      )}
                    </div>
                    <div className="cell net-cell">{net.toLocaleString()}</div>
                    <div className="cell action-cell">
                      {item && <button onClick={() => removeItem(item.id)}>X</button>}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="cart-grid total-row extended">
            <div>Total</div>
            <div></div>
            <div></div>
            <div>{grossTotal.toLocaleString()}</div>
            <div>{totalDiscount.toLocaleString()}</div>
            <div>{netTotal.toLocaleString()}</div>
            <div></div>
          </div>
        </div>

        <div className="poscard-right-placeholder">
          {!showPayment ? (
            <button
              className="pay-now-btn1"
              onClick={() => {
                setShowPayment(true);
                setAmountPaid(netTotal);
              }}
              disabled={!cartItems.length}
            >
              Pay Now
            </button>
          ) : (
            <div className="payment-card1">
              <div className="payment-title1">Payment</div>

              <div className="payment-row amount compact">
                <label>Amount</label>
                <input
                  type="text"
                  value={amountPaid.toLocaleString()}
                  onChange={(e) => {
                    const value = Number(e.target.value.replace(/,/g, ""));
                    setAmountPaid(value);
                  }}
                />
              </div>

              <div className="payment-row compact1">
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
                <div className="payment-row compact1">
                  <label>Bank</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                  >
                    <option value="">-- Bank --</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="payment-row compact1">
                <label>Balance</label>
                <strong>{(netTotal - amountPaid).toLocaleString()}</strong>
              </div>

              {/* ===== ACTION BUTTONS ===== */}
              <div className="payment-actions">
                <button className="preview-btn1" onClick={handlePrintPreview}>
                  Preview
                </button>
                <button className="complete-btn1" onClick={handleSubmit}>
                  Complete Sale
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ================= BOTTOM: CATEGORY + PRODUCT GRID ================= */}
      <div className="poscard-items">
        <div className="category-bar">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-tab ${
                activeCategory?.id === cat.id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
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

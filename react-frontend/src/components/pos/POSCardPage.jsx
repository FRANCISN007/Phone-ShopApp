import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./POSCardPage.css";

const POSCardPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null); // selected category object
  const [cartItems, setCartItems] = useState([]);

  const EMPTY_ROWS = 10; // number of visible sales rows

  
  /* =========================
     FETCH CATEGORIES & PRODUCTS
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    // fetch categories
    axiosWithAuth(token)
      .get("/stock/category/simple")
      .then((res) => setCategories(res.data)) // category object: {id, name}
      .catch(() => alert("Failed to load categories"));

    // fetch products
    axiosWithAuth(token)
      .get("/stock/products/simple-pos")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"));
  }, []);

  /* =========================
     CART LOGIC
  ========================= */
  const addItemToCart = (item) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const incrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalAmount = cartItems.reduce(
    (sum, i) => sum + i.qty * i.selling_price,
    0
  );

  /* Filter products by selected category */
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_name === activeCategory.name)
    : [];

  return (
    <div className="poscard-container">
      {/* ================= TOP ================= */}
      <div className="poscard-top">
        {/* ===== SALES GRID ===== */}
        <div className="poscard-cart">
          <div className="cart-header">
            <h2>Sales</h2>
            <button onClick={() => navigate("/dashboard")}>Exit</button>
          </div>

          {/* HEADER ROW */}
          <div className="cart-grid header">
            <div>Item</div>
            <div>Qty</div>
            <div>Amount</div>
            <div>X</div>
          </div>

          {/* DATA ROWS */}
          <div className="cart-items">
            {Array.from({ length: Math.max(EMPTY_ROWS, cartItems.length) }).map(
              (_, index) => {
                const item = cartItems[index];

                return (
                  <div
                    key={item ? item.id : `empty-${index}`}
                    className={`cart-grid row ${
                      item && index === cartItems.length - 1 ? "last-added" : ""
                    }`}
                  >
                    {/* ITEM NAME */}
                    <div className="cell item-name">
                      {item ? item.name : ""}
                    </div>

                    {/* QTY */}
                    <div
                      className={`cell qty-cell ${item ? "" : "empty-cell"}`}
                      onClick={() => item && incrementQty(item.id)}
                    >
                      {item ? item.qty : ""}
                    </div>

                    {/* AMOUNT */}
                    <div className="cell amount-cell">
                      {item
                        ? (item.qty * item.selling_price).toLocaleString()
                        : ""}
                    </div>

                    {/* ACTION */}
                    <div className="cell action-cell">
                      {item && (
                        <button onClick={() => removeItem(item.id)}>X</button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>


          {/* TOTAL ROW */}
          <div className="cart-grid total-row">
            <div>Total</div>
            <div></div>
            <div>{totalAmount.toLocaleString()}</div>
            <div></div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="poscard-right-placeholder">
          <h3>Notes / Info</h3>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="poscard-items">

        {/* ===== CATEGORY BAR (ALWAYS VISIBLE) ===== */}
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

        {/* ===== PRODUCT GRID (SHOW ONLY WHEN CATEGORY IS CLICKED) ===== */}
        <div className="item-grid">
          {activeCategory &&
            filteredProducts.map((item) => (
              <div
                key={item.id}
                className="item-card"
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

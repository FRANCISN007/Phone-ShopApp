import React, {
  useState,
  useMemo,
  useEffect,
  useCallback
} from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./SalesItemSold.css";

import { SHOP_NAME } from "../../config/constants";  // ✅ make sure this import exists
import { printReceipt } from "../pos/printReceipt";
import { numberToWords } from "../../utils/numberToWords";

const SalesItemSold = () => {
  // ================= DATE DEFAULT =================
  const today = new Date().toISOString().split("T")[0];

  const [show, setShow] = useState(true); // NEW: controls visibility

  // ================= FILTER STATE =================
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ================= DATA STATE =================
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  // ================= UI STATE =================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // ================= EDIT STATE =================
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({
    product_id: "",
    customer_name: "",
    customer_phone: "",
    ref_no: "",
    quantity: "",
    selling_price: "",
    discount: "" // ✅ ADD
  });

  const axiosInstance = useMemo(() => axiosWithAuth(), []);


  const normalizeSaleForPrint = (sale) => ({
    SHOP_NAME,
    invoice: sale.invoice_no,
    invoiceDate: sale.invoice_date,
    customerName: sale.customer_name || "-",
    customerPhone: sale.customer_phone || "-",
    refNo: sale.ref_no || "-",
    paymentMethod: sale.payment_status || "-",

    amountPaid: Number(sale.total_paid || 0),
    grossTotal: Number(sale.gross_total || sale.total_amount || 0),
    totalDiscount: Number(sale.total_discount || 0),
    netTotal: Number(sale.total_amount || 0),
    balance: Number(sale.balance_due || 0),

    items: sale.items.map(i => {
      const qty = Number(i.quantity || 0);
      const price = Number(i.selling_price || 0);
      const discount = Number(i.discount || 0);
      const gross = qty * price;

      return {
        product_name: i.product_name || i.product?.name || "Unknown",
        quantity: qty,
        selling_price: price,
        gross_amount: gross,
        discount,
        net_amount: gross - discount
      };
    })
  });



  // ================= LOAD PRODUCTS =================
  useEffect(() => {
    axiosInstance
      .get("/stock/products/simple")
      .then(res => setProducts(res.data || []))
      .catch(console.error);
  }, [axiosInstance]);

  // ================= PRODUCT FILTER =================
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

  // ================= FETCH ITEMS SOLD =================
  const fetchItemsSold = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        invoice_no: invoiceNo || undefined,
        product_id: selectedProduct?.id || undefined,
      };

      const response = await axiosInstance.get("/sales/item-sold", { params });

      const flattenedItems =
        response.data?.sales?.flatMap(sale =>
          sale.items.map(item => ({
            invoice_no: sale.invoice_no,
            invoice_date: sale.invoice_date,
            customer_name: sale.customer_name || "-",
            customer_phone: sale.customer_phone || "-",
            ref_no: sale.ref_no || "-",

            product_id: item.product_id,
            product_name: item.product_name || "-",

            quantity: item.quantity,
            selling_price: item.selling_price,

            gross_amount: item.gross_amount,
            discount: item.discount,
            total_amount: item.net_amount // ✅ USE THIS EVERYWHERE
          }))
        ) || [];


      setItems(flattenedItems);
    } catch (err) {
      console.error("❌ Failed to load items sold:", err);
      setError("Failed to load items sold");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, invoiceNo, selectedProduct, axiosInstance]);

  // ✅ Auto-load today
  useEffect(() => {
    fetchItemsSold();
  }, [fetchItemsSold]);

  // ================= TOTALS =================
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalQty += Number(item.quantity || 0);
        acc.totalAmount += Number(item.total_amount || 0);
        return acc;
      },
      { totalQty: 0, totalAmount: 0 }
    );
  }, [items]);

  // ================= HELPERS =================
  const formatAmount = value =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const handleReprint = async (invoiceNo) => {
  try {
    const res = await axiosInstance.get(`/sales/receipt/${invoiceNo}`);
    const sale = res.data;

    const receiptData = normalizeSaleForPrint(sale);

    printReceipt("80mm", {
      ...receiptData,
      amountInWords: numberToWords(receiptData.netTotal),

      formatCurrency: v => `₦${Number(v).toLocaleString()}`
    });
  } catch (err) {
    console.error(err);
    alert("Failed to reprint receipt");
  }
};


  const openEdit = (item) => {
    setEditItem(item);
    setEditData({
      old_product_id: item.product_id, // ✅ ADD THIS
      product_id: item.product_id,
      customer_name: item.customer_name === "-" ? "" : item.customer_name,
      customer_phone: item.customer_phone === "-" ? "" : item.customer_phone,
      ref_no: item.ref_no === "-" ? "" : item.ref_no,
      quantity: item.quantity,
      selling_price: item.selling_price,
      discount: item.discount || 0 // ✅ ADD
    });
  };

  const saveEdit = async () => {
    if (!editItem) return;

    try {
      // ================= HEADER UPDATE =================
      const salePayload = {};
      if (editData.customer_name.trim()) salePayload.customer_name = editData.customer_name.trim();
      if (editData.customer_phone.trim()) salePayload.customer_phone = editData.customer_phone.trim();
      if (editData.ref_no.trim()) salePayload.ref_no = editData.ref_no.trim();

      if (Object.keys(salePayload).length > 0) {
        await axiosInstance.put(`/sales/${editItem.invoice_no}`, salePayload);
      }

      // ================= ITEM UPDATE =================
      const itemPayload = {
        old_product_id: editData.old_product_id, // ✅ IMPORTANT
        product_id: editData.product_id,
        quantity: parseInt(editData.quantity, 10),
        selling_price: parseFloat(editData.selling_price),
        discount: parseFloat(editData.discount || 0) // ✅ ADD
      };

      await axiosInstance.put(`/sales/${editItem.invoice_no}/items`, itemPayload);

      setEditItem(null);
      fetchItemsSold();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  const deleteSale = async (invoiceNo) => {
    if (!invoiceNo) return;
    if (!window.confirm(`Are you sure you want to delete sale Invoice No: ${invoiceNo}?`)) return;

    try {
      await axiosInstance.delete(`/sales/${invoiceNo}`);
      fetchItemsSold();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert(err.response?.data?.detail || "Unable to delete sale. It may be linked to a payment.");
    }
  };


  if (!show) return null; // hide the component when closed

  // ================= RENDER =================
  return (
    <div className="sales-item-sold-container">

      {/* Close button */}
      <button
        className="close-btn"
        onClick={() => setShow(false)} // hides the page
      >
        ✖
      </button>
      <h2 className="sales-item-title">📦 Items Sold</h2>

      {/* FILTERS */}
      <div className="sales-item-filters">
        <label>
          Start Date
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>

        <label>
          End Date
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>

        <label>
          Invoice No (optional)
          <input type="number" placeholder="Invoice No" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
        </label>

        {/* PRODUCT DROPDOWN FILTER */}
        <div className="product-search-wrapper">
          <input
            type="text"
            placeholder="Search product..."
            value={productSearch}
            onChange={e => {
              setProductSearch(e.target.value);
              setSelectedProduct(null);
              setHighlightedIndex(-1);
            }}
            onKeyDown={e => {
              if (!filteredProducts.length) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
              }
              if (e.key === "Enter" && highlightedIndex >= 0) {
                e.preventDefault();
                const selected = filteredProducts[highlightedIndex];
                setSelectedProduct(selected);
                
                setHighlightedIndex(-1);
              }
            }}
          />
          {productSearch !== "" && filteredProducts.length > 0 && (
            <div className="product-search-dropdown">
              {filteredProducts.map((p, i) => (
                <div
                  key={p.id}
                  className={`product-search-item ${i === highlightedIndex ? "active" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => {
                    setSelectedProduct(p);
                
                    setProductSearch(p.name);
                    setHighlightedIndex(-1);
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={fetchItemsSold}>Search</button>
      </div>

      {/* STATUS */}
      {loading && <p className="status-text">Loading items sold...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {/* TABLE */}
      {!loading && !error && (
        <div className="sales-item-table-wrapper">
          
          <table className="sales-item-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone No</th>
                <th>Reference No</th>
                <th>Product</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Selling Price</th>
                <th className="text-right">Discount</th>

                <th className="text-right">Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="10" className="empty-row">No items found</td></tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.invoice_no}</td>
                    <td>{item.invoice_date?.slice(0, 10)}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.customer_phone}</td>
                    <td>{item.ref_no}</td>
                    <td>{item.product_name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{formatAmount(item.selling_price)}</td>
                    <td className="text-right">{formatAmount(item.discount)}</td>

                    <td className="text-right">{formatAmount(item.total_amount)}</td>
                    <td className="action-cell">
                      <button className="btn-print" onClick={() => handleReprint(item.invoice_no)}>🖨️</button>
                      <button className="btn-edit" onClick={() => openEdit(item)}>✏️</button>
                      <button className="btn-delete" onClick={() => deleteSale(item.invoice_no)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {items.length > 0 && (
              <tfoot>
                <tr className="total-row">
                  <td colSpan="7">TOTAL</td>
                  <td className="text-right">{totals.totalQty}</td>
                  <td></td>
                  <td className="text-right">{formatAmount(totals.totalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Sale</h3>

            {/* Display only fields */}
            <input value={editItem.invoice_no} disabled />
            <input value={editItem.invoice_date?.slice(0,10)} disabled />

            {/* Product dropdown for editing */}
            <div className="product-search-wrapper">
              <input
                type="text"
                placeholder="Search product..."
                value={productSearch !== "" ? productSearch : products.find(p => p.id === editData.product_id)?.name || ""}
                onChange={e => { setProductSearch(e.target.value); setHighlightedIndex(-1); }}
                onKeyDown={e => {
                  if (!filteredProducts.length) return;
                  if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex(prev => prev < filteredProducts.length-1 ? prev+1 : 0); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex(prev => prev>0?prev-1:filteredProducts.length-1); }
                  if (e.key==="Enter" && highlightedIndex>=0) {
                    e.preventDefault();
                    const selected = filteredProducts[highlightedIndex];
                    setEditData({...editData, product_id: selected.id});
                    setProductSearch("");
                    setHighlightedIndex(-1);
                  }
                }}
              />
              {productSearch!=="" && filteredProducts.length>0 && (
                <div className="product-search-dropdown">
                  {filteredProducts.map((p,i)=>(
                    <div
                      key={p.id}
                      className={`product-search-item ${i===highlightedIndex?"active":""}`}
                      onMouseEnter={()=>setHighlightedIndex(i)}
                      onClick={()=>{ setEditData({...editData, product_id: p.id}); setProductSearch(""); setHighlightedIndex(-1); }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input type="text" value={editData.customer_name} onChange={e=>setEditData({...editData, customer_name:e.target.value})} placeholder="Customer Name" />
            <input type="text" value={editData.customer_phone} onChange={e=>setEditData({...editData, customer_phone:e.target.value})} placeholder="Phone Number" />
            <input type="text" value={editData.ref_no} onChange={e=>setEditData({...editData, ref_no:e.target.value})} placeholder="Reference No" />
            <input type="number" value={editData.quantity} onChange={e=>setEditData({...editData, quantity:e.target.value})} placeholder="Quantity" />
            <input type="number" value={editData.selling_price} onChange={e=>setEditData({...editData, selling_price:e.target.value})} placeholder="Selling Price" />

            <input
                type="number"
                value={editData.discount}
                onChange={e =>
                  setEditData({ ...editData, discount: e.target.value })
                }
                placeholder="Discount"
              />

            <div className="modal-actions">
              <button onClick={saveEdit}>Save</button>
              <button onClick={()=>setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesItemSold;

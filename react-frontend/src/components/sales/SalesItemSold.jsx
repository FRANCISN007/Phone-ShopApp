import React, {
  useState,
  useMemo,
  useEffect,
  useCallback
} from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./SalesItemSold.css";



const SalesItemSold = () => {
  // ✅ Default dates = today
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const [productSearch, setProductSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // 🔹 Edit modal
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({
    customer_name: "",
    customer_phone: "",
    ref_no: "",
    quantity: "",
    selling_price: ""
  });

  const [products, setProducts] = useState([]);


  const filteredProducts = useMemo(() => {
  if (!productSearch.trim()) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
}, [productSearch, products]);


  
  useEffect(() => {
  const token = localStorage.getItem("token"); // adjust if using another auth method
  axiosWithAuth()
    .get("/stock/products/simple", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setProducts(res.data))
    .catch(console.error);
}, []);

  


  // ✅ stable axios instance (fixes hook warning)
  const axiosInstance = useMemo(() => axiosWithAuth(), []);

  // ================= FORMAT =================
  const formatAmount = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  // ================= FETCH =================
  const fetchItemsSold = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // use new instance inside function (like previous working code)
      const axiosInstance = axiosWithAuth();

      const response = await axiosInstance.get("/sales/item-sold", {
        params: {
          start_date: startDate, // use raw value from input
          end_date: endDate,
          invoice_no: invoiceNo || undefined,
        },
      });

      const flattenedItems =
        response.data?.sales?.flatMap((sale) =>
          sale.items.map((item) => ({
            invoice_no: sale.invoice_no,
            invoice_date: sale.invoice_date,
            customer_name: sale.customer_name || "-",
            customer_phone: sale.customer_phone || "-",
            ref_no: sale.ref_no || "-",
            product_id: item.product_id,
            product_name: item.product_name || "-",
            quantity: item.quantity,
            selling_price: item.selling_price,
            total_amount: item.total_amount,
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
  }, [startDate, endDate, invoiceNo]);

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

  // ================= EDIT =================
  const openEdit = (item) => {
    setEditItem(item);
    setEditData({
      product_id: item.product_id,
      customer_name: item.customer_name === "-" ? "" : item.customer_name,
      customer_phone: item.customer_phone === "-" ? "" : item.customer_phone,
      ref_no: item.ref_no === "-" ? "" : item.ref_no,
      quantity: item.quantity,
      selling_price: item.selling_price
    });
  };


  const saveEdit = async () => {
    if (!editItem) return;

    try {
      // ================= HEADER UPDATE =================
      const salePayload = {};
      if (editData.customer_name.trim() !== "") {
        salePayload.customer_name = editData.customer_name.trim();
      }
      if (editData.customer_phone.trim() !== "") {
        salePayload.customer_phone = editData.customer_phone.trim();
      }
      if (editData.ref_no.trim() !== "") {
        salePayload.ref_no = editData.ref_no.trim();
      }

      if (Object.keys(salePayload).length > 0) {
        await axiosInstance.put(`/sales/${editItem.invoice_no}`, salePayload);
      }

      // ================= ITEM UPDATE =================
      const itemPayload = {
        product_id: editData.product_id,
        quantity: parseInt(editData.quantity, 10),
        selling_price: parseFloat(editData.selling_price)
      };

      await axiosInstance.put(
        `/sales/${editItem.invoice_no}/items`,
        itemPayload
      );

      // Close modal and refresh table
      setEditItem(null);
      fetchItemsSold();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  
  // ================= DELETE =================
  const deleteSale = async (invoiceNo) => {
    if (!invoiceNo) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete sale Invoice No: ${invoiceNo}?`
    );

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/sales/${invoiceNo}`);
      fetchItemsSold();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert(
        err.response?.data?.detail ||
          "Unable to delete sale. It may be linked to a payment."
      );
    }
  };



  return (
    <div className="sales-item-sold-container">
      <h2 className="sales-item-title">📦 Items Sold</h2>

      {/* ================= FILTERS ================= */}
      <div className="sales-item-filters">
        <label>
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label>
          Invoice No (optional)
          <input
            type="number"
            placeholder="Invoice No"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </label>

        

        <button onClick={fetchItemsSold}>Search</button>
      </div>

      {/* ================= STATUS ================= */}
      {loading && <p className="status-text">Loading items sold...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {/* ================= TABLE ================= */}
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
                <th className="text-right">Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-row">
                    No items found
                  </td>
                </tr>
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
                    <td className="text-right">
                      {formatAmount(item.selling_price)}
                    </td>
                    <td className="text-right">
                      {formatAmount(item.total_amount)}
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-edit"
                        onClick={() => openEdit(item)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteSale(item.invoice_no)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {items.length > 0 && (
              <tfoot>
                <tr className="total-row">
                  <td colSpan="6">TOTAL</td>
                  <td className="text-right">{totals.totalQty}</td>
                  <td></td>
                  <td className="text-right">
                    {formatAmount(totals.totalAmount)}
                  </td>
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

            {/* Display only, no labels */}
            <input
              value={editItem.invoice_no}
              disabled
              placeholder="Invoice No"
            />

            <input
              value={editItem.invoice_date?.slice(0, 10)}
              disabled
              placeholder="Invoice Date"
            />

            {/* Searchable product dropdown */}
            <div className="product-search-wrapper">
              <input
                type="text"
                placeholder="Search product..."
                value={
                  // Show typed search text if any, otherwise show selected product name
                  productSearch !== "" 
                    ? productSearch 
                    : products.find(p => p.id === editData.product_id)?.name || ""
                }
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (!filteredProducts.length) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIndex(prev =>
                      prev < filteredProducts.length - 1 ? prev + 1 : 0
                    );
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex(prev =>
                      prev > 0 ? prev - 1 : filteredProducts.length - 1
                    );
                  }
                  if (e.key === "Enter" && highlightedIndex >= 0) {
                    e.preventDefault();
                    const selected = filteredProducts[highlightedIndex];
                    setEditData({ ...editData, product_id: selected.id });
                    setProductSearch(""); // clear search after selection
                    setHighlightedIndex(-1);
                  }
                }}
              />

              {/* Dropdown */}
              {productSearch !== "" && filteredProducts.length > 0 && (
                <div className="product-search-dropdown">
                  {filteredProducts.map((p, i) => (
                    <div
                      key={p.id}
                      className={`product-search-item ${i === highlightedIndex ? "active" : ""}`}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => {
                        setEditData({ ...editData, product_id: p.id });
                        setProductSearch(""); // clear search after selection
                        setHighlightedIndex(-1);
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>



            <input
              type="text"
              value={editData.customer_name}
              onChange={(e) =>
                setEditData({ ...editData, customer_name: e.target.value })
              }
              placeholder="Customer Name"
            />

            <input
              type="text"
              value={editData.customer_phone}
              onChange={(e) =>
                setEditData({ ...editData, customer_phone: e.target.value })
              }
              placeholder="Phone Number"
            />

            <input
              type="text"
              value={editData.ref_no}
              onChange={(e) =>
                setEditData({ ...editData, ref_no: e.target.value })
              }
              placeholder="Reference No"
            />

            <input
              type="number"
              value={editData.quantity}
              onChange={(e) =>
                setEditData({ ...editData, quantity: e.target.value })
              }
              placeholder="Quantity"
            />

            <input
              type="number"
              value={editData.selling_price}
              onChange={(e) =>
                setEditData({ ...editData, selling_price: e.target.value })
              }
              placeholder="Selling Price"
            />

            <div className="modal-actions">
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesItemSold;

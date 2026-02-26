// print_A4_receipt_formatted.jsx
export const printA4Receipt = ({
  SHOP_NAME,
  invoice,
  invoiceDate,
  customerName,
  customerPhone,
  refNo,
  paymentMethod,
  amountPaid = 0,
  grossTotal = 0,
  totalDiscount = 0,
  netTotal = 0,
  balance = 0,
  items = [],
  amountInWords
}) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  // Helper to format numbers with commas
  const formatNumber = (num) => Number(num).toLocaleString();

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="width:30%">${item.product_name}</td>
        <td style="width:8%; text-align:center;">${item.quantity}</td>
        <td style="width:12%; text-align:right;">${formatNumber(item.selling_price)}</td>
        <td style="width:15%; text-align:right;">${formatNumber(item.gross_amount)}</td>
        <td style="width:15%; text-align:right;">${formatNumber(item.discount || 0)}</td>
        <td style="width:20%; text-align:right;">${formatNumber(item.net_amount)}</td>
      </tr>
    `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt-A4</title>
        <style>
          body {
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          th {
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            text-align: left;
            font-size: 11px;
          }
          td { padding: 4px 0; font-size: 11px; text-align:right; }
          td:first-child { text-align:left; }
          td:nth-child(2) { text-align:center; }
          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 4px;
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
        <div>
          Payment: ${amountPaid > 0 && paymentMethod ? paymentMethod.toUpperCase() : "NOT PAID"}
        </div>
        <hr />

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Gross</th>
              <th>Discount</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr />

        <div class="total-line">
          <span>Gross Total:</span>
          <span>${formatNumber(grossTotal)}</span>
        </div>

        <div class="total-line">
          <span>Total Discount:</span>
          <span>- ${formatNumber(totalDiscount)}</span>
        </div>

        <div class="total-line">
          <span>Net Total:</span>
          <span>${formatNumber(netTotal)}</span>
        </div>

        <div class="total-line">
          <span>Paid:</span>
          <span>${formatNumber(amountPaid)}</span>
        </div>

        <div class="total-line">
          <span>Balance:</span>
          <span>${formatNumber(balance)}</span>
        </div>

        <hr />

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

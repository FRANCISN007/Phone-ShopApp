// print_A4_receipt.jsx
export const printA4Receipt = ({
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
  balance,
  items,
  amountInWords,
  formatCurrency
}) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="width:30%">${item.product_name}</td>
        <td style="width:8%; text-align:center;">${item.quantity}</td>
        <td style="width:12%; text-align:right;">${formatCurrency(item.selling_price)}</td>
        <td style="width:15%; text-align:right;">${formatCurrency(item.gross_amount)}</td>
        <td style="width:15%; text-align:right;">${formatCurrency(item.discount || 0)}</td>
        <td style="width:20%; text-align:right;">${formatCurrency(item.net_amount)}</td>
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
          td { padding: 4px 0; font-size: 11px; }
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
          Payment:
          ${
            amountPaid > 0 && paymentMethod
              ? paymentMethod.toUpperCase()
              : "NOT PAID"
          }
        </div>
        <hr />

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Gross</th>
              <th style="text-align:right;">Discount</th>
              <th style="text-align:right;">Net</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr />

        <div class="total-line">
          <span>Gross Total:</span>
          <span>${formatCurrency(grossTotal)}</span>
        </div>

        <div class="total-line">
          <span>Total Discount:</span>
          <span>- ${formatCurrency(totalDiscount)}</span>
        </div>

        <div class="total-line">
          <span>Net Total:</span>
          <span>${formatCurrency(netTotal)}</span>
        </div>

        <div class="total-line">
          <span>Paid:</span>
          <span>${formatCurrency(amountPaid)}</span>
        </div>

        <div class="total-line">
          <span>Balance:</span>
          <span>${formatCurrency(balance)}</span>
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

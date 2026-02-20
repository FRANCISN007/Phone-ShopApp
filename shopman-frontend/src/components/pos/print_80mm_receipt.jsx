// print_80mm_receipt.jsx
export const print80mmReceipt = ({
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
  const printWindow = window.open("", "_blank", "width=320,height=600");

  // Map items into rows for thermal receipt
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="width:35%">${item.product_name}</td>
        <td style="width:10%; text-align:center;">${item.quantity}</td>
        <td style="width:15%; text-align:right;">${formatCurrency(item.selling_price)}</td>
        <td style="width:15%; text-align:right;">${formatCurrency(item.gross_amount)}</td>
        <td style="width:10%; text-align:right;">${formatCurrency(item.discount || 0)}</td>
        <td style="width:15%; text-align:right;">${formatCurrency(item.net_amount)}</td>
      </tr>
    `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt-80mm</title>
        <style>
          body {
            font-family: monospace;
            font-size: 10px;
            padding: 5px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          hr { border: 0; border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; font-weight: bold; padding-bottom: 2px; }
          td { padding: 1px 0; }
          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 2px;
          }
          .footer {
            margin-top: 5px;
            text-align: center;
            font-size: 9px;
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

        <!-- Table Header -->
        <table>
          <thead>
            <tr>
              <th style="width:35%">Product</th>
              <th style="width:10%; text-align:center;">Qty</th>
              <th style="width:15%; text-align:right;">Price</th>
              <th style="width:15%; text-align:right;">Gross</th>
              <th style="width:10%; text-align:right;">Discount</th>
              <th style="width:15%; text-align:right;">Net</th>
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

        <div style="margin-top:4px; font-size:9px;">
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

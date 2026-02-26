// print_80mm_receipt_thermal_formatted.jsx
export const print80mmReceipt = ({
  SHOP_NAME = "SHOP",
  invoice = "-",
  invoiceDate = "-",
  customerName = "-",
  customerPhone = "-",
  refNo = "-",
  paymentMethod = "-",
  amountPaid = 0,
  grossTotal = 0,
  totalDiscount = 0,
  netTotal = 0,
  balance = 0,
  items = [],
  amountInWords = ""
}) => {
  const printWindow = window.open("", "_blank");

  // Helper to format numbers with commas
  const formatNumber = (num) => Number(num).toLocaleString();

  // Map items into rows with formatted figures
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="width:35%">${item.product_name}</td>
          <td style="width:10%; text-align:center;">${item.quantity}</td>
          <td style="width:15%; text-align:right;">${formatNumber(item.selling_price)}</td>
          <td style="width:15%; text-align:right;">${formatNumber(item.gross_amount)}</td>
          <td style="width:10%; text-align:right;">${formatNumber(item.discount || 0)}</td>
          <td style="width:15%; text-align:right;">${formatNumber(item.net_amount)}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt-80mm</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: monospace, Arial, sans-serif;
            font-size: 9px; /* smaller font */
            padding: 5px;
            margin: 0;
            width: 80mm;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          hr { border: 0; border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th { text-align: left; font-weight: bold; padding-bottom: 2px; }
          td { padding: 1px 0; }
          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px; /* smaller font */
            margin-top: 2px;
          }
          .footer {
            margin-top: 5px;
            text-align: center;
            font-size: 8px; /* smaller footer font */
          }
          @media print {
            body { width: 80mm; }
            table, th, td { font-size: 9px; }
            hr { margin: 2px 0; }
          }
        </style>
      </head>
      <body>
        <div class="center bold">${SHOP_NAME.toUpperCase()}</div>
        <div class="center">SALES RECEIPT</div>
        <hr />

        <div>Invoice: ${invoice}</div>
        <div>Date: ${invoiceDate}</div>
        <div>Customer: ${customerName}</div>
        <div>Phone: ${customerPhone}</div>
        <div>Ref No: ${refNo}</div>
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

        <div style="margin-top:4px; font-size:8px;">
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

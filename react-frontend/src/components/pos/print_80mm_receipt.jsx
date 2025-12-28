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
  totalAmount,
  balance,
  items,
  amountInWords,
  formatCurrency
}) => {
  const printWindow = window.open("", "_blank", "width=320,height=600");

  // Table-style items for better alignment on thermal paper
  const itemsHtml = items.map(item => `
    <tr>
      <td style="width:60%">${item.name}</td>
      <td style="width:10%; text-align:center;">${item.quantity}</td>
      <td style="width:15%; text-align:right;">${formatCurrency(item.selling_price)}</td>
      <td style="width:15%; text-align:right;">${formatCurrency(item.total_amount)}</td>
    </tr>
  `).join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: monospace;
            font-size: 10px;
            padding: 5px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          hr { border: 0; border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
          th { text-align: left; padding-bottom: 2px; font-weight: bold; }
          td { padding: 1px 0; }
          .total-line { font-weight: bold; text-align: right; margin-top: 2px; }
          .footer { margin-top: 5px; text-align: center; font-size: 9px; }
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
        <div>Payment: ${amountPaid > 0 && paymentMethod ? paymentMethod.toUpperCase() : "NOT PAID"}</div>
        <hr />

        <!-- Table Header -->
        <table>
          <thead>
            <tr>
              <th style="width:60%">Item</th>
              <th style="width:10%; text-align:center;">Qty</th>
              <th style="width:15%; text-align:right;">Price</th>
              <th style="width:15%; text-align:right;">Total</th>
            </tr>
          </thead>
        </table>

        <!-- Table Items -->
        <table>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <hr />

        <div class="total-line">Total: ${formatCurrency(totalAmount)}</div>
        <div class="total-line">Paid: ${formatCurrency(amountPaid)}</div>
        <div class="total-line">Balance: ${formatCurrency(balance)}</div>

        <div style="margin-top:4px; font-size:9px;">
          Amount in Words:<br/>
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

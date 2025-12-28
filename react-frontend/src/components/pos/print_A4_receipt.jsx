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
  totalAmount,
  balance,
  items,
  amountInWords,
  formatCurrency
}) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">${formatCurrency(item.selling_price)}</td>
      <td style="text-align:right;">${formatCurrency(item.total_amount)}</td>
    </tr>
  `).join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
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
          th { border-bottom: 1px solid #000; padding-bottom: 4px; text-align: left; }
          td { padding: 4px 0; }
          .total { font-weight: bold; text-align: right; margin-top: 8px; }
          .footer { margin-top: 10px; text-align: center; }
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

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr />

        <table style="width:100%; font-size:12px;">
          <tr>
            <td><strong>Total:</strong> ${formatCurrency(totalAmount)}</td>
            <td style="text-align:center;"><strong>Paid:</strong> ${formatCurrency(amountPaid)}</td>
            <td style="text-align:right;"><strong>Balance:</strong> ${formatCurrency(balance)}</td>
          </tr>
        </table>

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

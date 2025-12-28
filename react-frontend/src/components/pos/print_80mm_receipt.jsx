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

  const itemsHtml = items.map(item => `
    ${item.name} x ${item.quantity} @ ${formatCurrency(item.selling_price)}
    TOTAL: ${formatCurrency(item.total_amount)}
  `).join("<br/>");

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
          .total-line { font-weight: bold; text-align: right; }
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

        ${itemsHtml}
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

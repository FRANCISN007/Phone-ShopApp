// print_80mm_receipt_thermal_formatted.jsx

export const print80mmReceipt = ({
  RECEIPT_NAME,
  BUSINESS_ADDRESS,
  BUSINESS_PHONE,
  BUSINESS_LOGO,
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

  // 🚨 Do not print if business name missing
  if (!RECEIPT_NAME) {
    alert("Business name missing. Please login again.");
    return;
  }

  const printWindow = window.open("", "_blank");

  const formatNumber = (num) =>
    Number(num || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="width:35%">${item.product_name || "-"}</td>
          <td style="width:10%; text-align:center;">${item.quantity || 0}</td>
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
        <title>${RECEIPT_NAME} - Receipt</title>
        <style>
          @page { size: 80mm auto; margin: 0; }

          body {
            font-family: monospace, Arial, sans-serif;
            font-size: 9px;
            padding: 5px;
            margin: 0;
            width: 80mm;
          }

          .center { text-align: center; }
          .bold { font-weight: bold; }
          .small { font-size: 8px; }

          hr {
            border: 0;
            border-top: 1px dashed #000;
            margin: 4px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }

          th {
            text-align: left;
            font-weight: bold;
            padding-bottom: 2px;
          }

          td { padding: 1px 0; }

          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px;
            margin-top: 2px;
          }

          .footer {
            margin-top: 6px;
            text-align: center;
            font-size: 8px;
          }

          .logo {
            text-align: center;
            margin-bottom: 4px;
          }

          .logo img {
            max-width: 60px;
            max-height: 60px;
          }

          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>

      <body>

        ${BUSINESS_LOGO ? `<div class="logo"><img src="${BUSINESS_LOGO}" /></div>` : ""}

        <div class="center bold">${RECEIPT_NAME.toUpperCase()}</div>

        ${BUSINESS_ADDRESS ? `<div class="center small">${BUSINESS_ADDRESS}</div>` : ""}
        ${BUSINESS_PHONE ? `<div class="center small">Tel: ${BUSINESS_PHONE}</div>` : ""}

        <div class="center bold" style="margin-top:4px;">SALES RECEIPT</div>
        <hr />

        <div>Invoice: ${invoice}</div>
        <div>Date: ${invoiceDate}</div>
        <div>Customer: ${customerName}</div>
        ${customerPhone ? `<div>Phone: ${customerPhone}</div>` : ""}
        ${refNo ? `<div>Ref No: ${refNo}</div>` : ""}
        <div>Payment: ${
          amountPaid > 0 && paymentMethod
            ? paymentMethod.toUpperCase()
            : "NOT PAID"
        }</div>

        <hr />

        <table>
          <thead>
            <tr>
              <th style="width:35%">Product</th>
              <th style="width:10%; text-align:center;">Qty</th>
              <th style="width:15%; text-align:right;">Price</th>
              <th style="width:15%; text-align:right;">Gross</th>
              <th style="width:10%; text-align:right;">Disc</th>
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

        <div class="small" style="margin-top:4px;">
          <strong>Amount in Words:</strong><br/>
          ${amountInWords || "-"}
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

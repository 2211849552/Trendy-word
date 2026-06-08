function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildCustomersPrintHtml(customers) {
  const rows = customers
    .map(
      (customer) => `
        <tr>
          <td>${escapeHtml(customer.name)}</td>
          <td dir="ltr">${escapeHtml(customer.email)}</td>
          <td dir="ltr">${escapeHtml(customer.phone)}</td>
          <td>${escapeHtml(customer.location)}</td>
          <td>${customer.orders ?? 0}</td>
          <td dir="ltr">${customer.totalSpent ?? 0} د.ل</td>
          <td>${escapeHtml(customer.joinDate)}</td>
          <td>${escapeHtml(customer.status)}</td>
        </tr>`,
    )
    .join('')

  const emptyRow = customers.length
    ? ''
    : '<tr><td colspan="8" style="text-align:center;padding:24px;">لا يوجد زبائن للطباعة</td></tr>'

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>قائمة الزبائن</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { text-align: center; margin-bottom: 8px; }
    p { text-align: center; color: #555; margin-bottom: 24px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
    th { background: #f3f4f6; }
    @media print {
      body { padding: 12px; }
    }
  </style>
</head>
<body>
  <h1>قائمة الزبائن</h1>
  <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-LY')}</p>
  <table>
    <thead>
      <tr>
        <th>الاسم</th>
        <th>البريد الإلكتروني</th>
        <th>الهاتف</th>
        <th>الموقع</th>
        <th>الطلبات</th>
        <th>الإنفاق الكلي</th>
        <th>تاريخ الانضمام</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>${rows || emptyRow}</tbody>
  </table>
</body>
</html>`
}

export function openCustomersPrintWindow(customers) {
  const html = buildCustomersPrintHtml(customers)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank', 'width=1024,height=768')

  if (!printWindow) {
    URL.revokeObjectURL(url)
    return false
  }

  const cleanup = () => URL.revokeObjectURL(url)

  const triggerPrint = () => {
    try {
      printWindow.focus()
      printWindow.print()
    } finally {
      cleanup()
    }
  }

  printWindow.addEventListener('load', triggerPrint, { once: true })
  setTimeout(triggerPrint, 800)

  return true
}

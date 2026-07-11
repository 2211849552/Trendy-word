export function openStoresPrintWindow(stores) {
  const rows = stores
    .map(
      (store) => `
        <tr>
          <td>${escapeHtml(store.name)}</td>
          <td>${escapeHtml(store.merchant)}</td>
          <td dir="ltr">${escapeHtml(store.email)}</td>
          <td dir="ltr">${escapeHtml(store.phone)}</td>
          <td>${escapeHtml(store.city)}</td>
          <td>${store.status === 'active' ? 'نشط' : store.status === 'pending' ? 'معلق' : store.status === 'banned' ? 'محظور' : 'معطل'}</td>
          <td>${escapeHtml(store.createdAt || '—')}</td>
        </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>قائمة المتاجر</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { text-align: center; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>قائمة المتاجر</h1>
  <table>
    <thead>
      <tr>
        <th>المتجر</th>
        <th>التاجر</th>
        <th>البريد</th>
        <th>الهاتف</th>
        <th>المنطقة</th>
        <th>الحالة</th>
        <th>تاريخ الإنشاء</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768')
  if (!printWindow) return false

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

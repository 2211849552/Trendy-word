import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildFinanceReportHtml(transactions, summary = {}) {
  const rows = transactions
    .map(
      (tx) => `
        <tr>
          <td>${escapeHtml(tx.id)}</td>
          <td>${escapeHtml(tx.customer)}</td>
          <td>${escapeHtml(tx.store)}</td>
          <td dir="ltr">${Number(tx.amount ?? 0).toLocaleString('ar-LY')} د.ل</td>
          <td>${escapeHtml(tx.type)}</td>
          <td>${escapeHtml(tx.date)}</td>
          <td>${escapeHtml(tx.status)}</td>
        </tr>`,
    )
    .join('')

  const emptyRow = transactions.length
    ? ''
    : '<tr><td colspan="7" style="text-align:center;padding:24px;">لا توجد معاملات للتصدير</td></tr>'

  const filterParts = []
  if (summary.typeFilter && summary.typeFilter !== 'جميع الأنواع') {
    filterParts.push(`نوع الدفع: ${escapeHtml(summary.typeFilter)}`)
  }
  if (summary.searchQuery?.trim()) {
    filterParts.push(`البحث: ${escapeHtml(summary.searchQuery.trim())}`)
  }
  const filterLine = filterParts.length
    ? `<p style="text-align:center;color:#555;margin:0 0 16px;font-size:13px;">${filterParts.join(' · ')}</p>`
    : ''

  return `
    <h1 style="text-align:center;margin:0 0 8px;font-size:22px;color:#111;">التقرير المالي</h1>
    <p style="text-align:center;color:#555;margin:0 0 20px;font-size:13px;">تاريخ التصدير: ${new Date().toLocaleString('ar-LY')}</p>
    ${filterLine}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
      <div style="border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#666;">إجمالي الإيرادات</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#059669;">${escapeHtml(summary.totalRevenue ?? '0 د.ل')}</p>
      </div>
      <div style="border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#666;">أرباح الاشتراكات والإعلانات</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#059669;">${escapeHtml(summary.subscriptionAndAdProfits ?? '0 د.ل')}</p>
      </div>
      <div style="border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#666;">أرباح التوصيل</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#059669;">${escapeHtml(summary.deliveryProfits ?? '0 د.ل')}</p>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">رقم المعاملة</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">الزبون</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">المتجر</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">المبلغ</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">نوع العملية</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">التاريخ</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:right;background:#f3f4f6;">الحالة</th>
        </tr>
      </thead>
      <tbody>${rows || emptyRow}</tbody>
    </table>
    <p style="margin-top:16px;font-size:12px;color:#666;text-align:left;">عدد المعاملات: ${transactions.length}</p>
  `
}

function buildPdfFilename() {
  const dateStamp = new Date().toISOString().slice(0, 10)
  return `finance-report-${dateStamp}.pdf`
}

export async function downloadFinanceReportPdf(transactions, summary = {}) {
  const container = document.createElement('div')
  container.setAttribute('dir', 'rtl')
  container.setAttribute('lang', 'ar')
  container.style.cssText = [
    'position:fixed',
    'left:-10000px',
    'top:0',
    'width:794px',
    'background:#ffffff',
    'padding:24px',
    'color:#111111',
    'font-family:Arial,sans-serif',
    'line-height:1.4',
  ].join(';')
  container.innerHTML = buildFinanceReportHtml(transactions, summary)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(buildPdfFilename())
    return true
  } catch {
    return false
  } finally {
    document.body.removeChild(container)
  }
}

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'screenshots', 'admin')

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173'
const EMAIL = process.env.SCREENSHOT_EMAIL || process.env.ADMIN_EMAIL || 'admin@trendy.com'
const PASSWORD = process.env.SCREENSHOT_PASSWORD || process.env.ADMIN_PASSWORD || 'password'

const SECTIONS = [
  { id: 'finance', label: 'الإدارة المالية', file: 'finance.png' },
  { id: 'catalog', label: 'إدارة الكتالوج', file: 'catalog.png' },
  { id: 'customers', label: 'إدارة الزبائن', file: 'customers.png' },
]

async function expandScrollContainers(page) {
  await page.evaluate(() => {
    const root = document.querySelector('.flex.h-dvh')
    const main = document.querySelector('main')
    if (root) {
      root.style.height = 'auto'
      root.style.minHeight = '100vh'
      root.style.overflow = 'visible'
    }
    if (main) {
      main.style.height = 'auto'
      main.style.minHeight = '100vh'
      main.style.overflow = 'visible'
    }
    document.documentElement.style.height = 'auto'
    document.body.style.height = 'auto'
    document.body.style.overflow = 'visible'
  })
}

async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })

  const emailInput = page.locator('input[type="email"]').first()
  const needsLogin = await emailInput.isVisible().catch(() => false)
  if (needsLogin) {
    await emailInput.fill(EMAIL)
    await page.locator('input[type="password"]').first().fill(PASSWORD)
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click()
  }

  await page.waitForSelector('aside nav', { timeout: 30000 })
  await page.waitForTimeout(2000)
}

async function waitForFinanceReady(page) {
  const loadingTexts = [
    'جاري تحميل المعاملات',
    'جاري تحميل الإيرادات الشهرية',
    'جاري تحميل توزيع طرق الدفع',
  ]

  await page.waitForFunction(
    (texts) => texts.every((text) => !document.body.innerText.includes(text)),
    loadingTexts,
    { timeout: 120000 },
  )

  await page.waitForFunction(
    () => {
      const bodyText = document.body.innerText
      if (bodyText.includes('جاري تحميل المعاملات')) return false

      const footer = bodyText.match(/عرض\s+\d+\s+من\s+(\d+)\s+معاملة/)
      if (footer && Number(footer[1]) > 0) return true

      if (bodyText.includes('لا توجد معاملات مطابقة')) return true
      if (bodyText.includes('تعذّر تحميل المعاملات')) return true

      return document.querySelectorAll('table tbody tr td.font-mono').length > 0
    },
    null,
    { timeout: 120000 },
  )

  await page.waitForTimeout(2500)
}

async function captureSection(page, section) {
  const navButton = page.locator('aside nav button', { hasText: section.label })
  await navButton.first().click()
  await page.waitForTimeout(1500)

  if (section.id === 'finance') {
    await waitForFinanceReady(page)
  } else {
    await page.waitForFunction(
      () => !document.body.innerText.includes('جاري التحميل'),
      null,
      { timeout: 15000 },
    ).catch(() => {})
    await page.waitForTimeout(1500)
  }

  await expandScrollContainers(page)
  await page.waitForTimeout(500)

  const outputPath = path.join(OUT_DIR, section.file)
  await page.screenshot({ path: outputPath, fullPage: true })
  return outputPath
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const only = process.env.SCREENSHOT_ONLY?.trim()
  const sections = only
    ? SECTIONS.filter((section) => section.id === only)
    : SECTIONS

  if (!sections.length) {
    throw new Error(`Unknown SCREENSHOT_ONLY value: ${only}`)
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-LY',
  })
  const page = await context.newPage()

  try {
    await login(page)
    const saved = []

    for (const section of sections) {
      const filePath = await captureSection(page, section)
      saved.push(filePath)
      console.log(`Saved: ${filePath}`)
    }

    console.log(`\nDone. ${saved.length} screenshots saved to ${OUT_DIR}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createWorker } from 'tesseract.js'

type Bill = {
  id: string
  merchantName: string
  amount: number
  subtotal?: number
  date?: string
  category: string
  rawText: string
  createdAt: string
}

const STORAGE_KEY = 'ai-receipt-manager-bills'

const categoryRules: Array<{ keyword: string; category: string }> = [
  { keyword: '7-eleven', category: '飲食' },
  { keyword: '全家', category: '飲食' },
  { keyword: 'uber', category: '交通' },
  { keyword: '台灣大車隊', category: '交通' },
  { keyword: '屈臣氏', category: '生活' },
  { keyword: 'mcdonald', category: '飲食' },
]

const amountRegex = /(total|總計|小計)\s*[:：]?\s*(?:nt\$|n\.?t\.?\$|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gim
const dateRegex = /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/g

function parseReceipt(rawText: string) {
  let amount: number | undefined
  let subtotal: number | undefined

  for (const match of rawText.matchAll(amountRegex)) {
    const key = (match[1] ?? '').toLowerCase()
    const value = Number((match[2] ?? '').replaceAll(',', ''))
    if (Number.isNaN(value)) continue

    if (key.includes('小計')) subtotal = value
    else amount = value
  }

  const firstDate = rawText.match(dateRegex)?.[0]
  const merchantName =
    rawText
      .split('\n')
      .map((v) => v.trim())
      .find((v) => v.length > 0) ?? 'Unknown Merchant'

  return { amount, subtotal, date: firstDate, merchantName }
}

function classifyMerchant(merchantName: string, rawText: string) {
  const source = `${merchantName} ${rawText}`.toLowerCase()
  const hit = categoryRules.find((r) => source.includes(r.keyword.toLowerCase()))
  return hit?.category ?? '未分類'
}

function loadBills(): Bill[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Bill[]
  } catch {
    return []
  }
}

function App() {
  const [ocrText, setOcrText] = useState('')
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bills, setBills] = useState<Bill[]>(() => loadBills())

  const totals = useMemo(() => {
    const total = bills.reduce((sum, b) => sum + b.amount, 0)
    return { count: bills.length, total }
  }, [bills])

  const handleImageOCR = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsOcrLoading(true)

    try {
      const worker = await createWorker(['chi_tra', 'eng'])
      const ret = await worker.recognize(file)
      setOcrText(ret.data.text)
      await worker.terminate()
    } catch (e) {
      setError(`OCR 失敗：${e instanceof Error ? e.message : '未知錯誤'}`)
    } finally {
      setIsOcrLoading(false)
    }
  }

  const handleSaveBill = () => {
    setError(null)

    if (!ocrText.trim()) {
      setError('請先貼上 OCR 文字或上傳帳單圖片。')
      return
    }

    const parsed = parseReceipt(ocrText)
    if (!parsed.amount) {
      setError('找不到「總計/Total/小計」金額，請檢查文字內容。')
      return
    }

    const bill: Bill = {
      id: crypto.randomUUID(),
      merchantName: parsed.merchantName,
      amount: parsed.amount,
      subtotal: parsed.subtotal,
      date: parsed.date,
      category: classifyMerchant(parsed.merchantName, ocrText),
      rawText: ocrText,
      createdAt: new Date().toISOString(),
    }

    const next = [bill, ...bills]
    setBills(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const clearBills = () => {
    setBills([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Privacy-First Prototype</p>
          <h1 className="mt-2 text-3xl font-bold">AI 隱私帳單管家</h1>
          <p className="mt-2 text-sm text-stone-600">
            展示 AI + 系統整合：Vision OCR 思路、Regex/日期解析、Core ML 分類 wrapper 概念、離線儲存與 Siri Intent 流程。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Phase 1 + 2：OCR 與解析</h2>
            <p className="mt-1 text-sm text-stone-600">瀏覽器端 OCR（Tesseract.js，本地執行）→ Regex 抽金額 + 日期偵測。</p>

            <label className="mt-4 block text-sm font-medium">上傳帳單圖片（可選）</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageOCR}
              className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            {isOcrLoading && <p className="mt-3 text-sm text-amber-700">OCR 辨識中，請稍候…</p>}

            <label className="mt-4 block text-sm font-medium">OCR 文字（可手動貼上）</label>
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              rows={10}
              placeholder={'7-ELEVEN\n總計: 180\n日期: 2026/02/12'}
              className="mt-2 w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleSaveBill}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                解析並儲存
              </button>
              <button
                onClick={() => setOcrText('')}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium hover:bg-stone-50"
              >
                清空文字
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Phase 3 + 4 + 5：分類 / 儲存 / Siri</h2>
            <ul className="mt-2 space-y-2 text-sm text-stone-700">
              <li>• 分類核心：以關鍵字規則模擬 Core ML 文字分類結果（可替換為 ExpenseClassifier.mlmodel）</li>
              <li>• 資料存儲：目前用 LocalStorage 模擬 SwiftData 離線資料庫</li>
              <li>• 同步概念：正式 iOS 版可啟用 CloudKit 讓多裝置同步</li>
              <li>• Siri：正式 iOS 版以 AppIntent + AppShortcutsProvider 支援「記下這張帳單」</li>
            </ul>

            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-medium">原型摘要</p>
              <p className="mt-2 text-sm text-stone-600">帳單筆數：{totals.count}</p>
              <p className="text-sm text-stone-600">總支出：NT$ {totals.total.toLocaleString()}</p>
              <button
                onClick={clearBills}
                className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-100"
              >
                清空本地資料
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">已儲存帳單（離線）</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="px-3 py-2 font-medium">店家</th>
                  <th className="px-3 py-2 font-medium">分類</th>
                  <th className="px-3 py-2 font-medium">金額</th>
                  <th className="px-3 py-2 font-medium">日期</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-stone-500" colSpan={4}>
                      尚無資料，先上傳一張帳單或貼 OCR 文字試試。
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{bill.merchantName}</td>
                      <td className="px-3 py-2">{bill.category}</td>
                      <td className="px-3 py-2">NT$ {bill.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">{bill.date ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App

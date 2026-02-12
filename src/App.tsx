import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
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

  const saveBills = (next: Bill[]) => {
    setBills(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

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

    saveBills([bill, ...bills])
    setOcrText('')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-100 text-stone-900">
        <header className="border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AIReceiptManager</p>
          <h1 className="text-xl font-bold">隱私優先 AI 帳單管家</h1>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6">
          <Routes>
            <Route path="/" element={<HomePage count={totals.count} total={totals.total} />} />
            <Route
              path="/scan"
              element={
                <ScanPage
                  ocrText={ocrText}
                  setOcrText={setOcrText}
                  onUpload={handleImageOCR}
                  onSave={handleSaveBill}
                  loading={isOcrLoading}
                  error={error}
                />
              }
            />
            <Route path="/bills" element={<BillsPage bills={bills} />} />
            <Route
              path="/settings"
              element={<SettingsPage onClear={() => saveBills([])} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1 px-3 py-2 text-xs sm:text-sm">
            <Tab to="/" label="首頁" />
            <Tab to="/scan" label="掃描" />
            <Tab to="/bills" label="帳單" />
            <Tab to="/settings" label="設定" />
          </div>
        </nav>
      </div>
    </BrowserRouter>
  )
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-center font-medium ${isActive ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`
      }
    >
      {label}
    </NavLink>
  )
}

function HomePage({ count, total }: { count: number; total: number }) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">原型亮點</h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          <li>• OCR（本地執行）＋ 規則解析（總計/日期）</li>
          <li>• 分類器流程可替換為 CoreML ExpenseClassifier</li>
          <li>• 離線儲存對齊 SwiftData 概念，iOS 可接 CloudKit</li>
          <li>• Siri 指令流程：記下這張帳單</li>
        </ul>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">帳單筆數</p>
          <p className="mt-1 text-3xl font-bold">{count}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">總支出</p>
          <p className="mt-1 text-3xl font-bold">NT$ {total.toLocaleString()}</p>
        </div>
      </div>
    </section>
  )
}

type ScanPageProps = {
  ocrText: string
  setOcrText: (v: string) => void
  onUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
  onSave: () => void
  loading: boolean
  error: string | null
}

function ScanPage({ ocrText, setOcrText, onUpload, onSave, loading, error }: ScanPageProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">掃描帳單</h2>
      <p className="mt-1 text-sm text-stone-600">上傳影像或貼 OCR 文字，然後儲存成帳單。</p>

      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="mt-4 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />

      {loading && <p className="mt-2 text-sm text-amber-700">OCR 辨識中，請稍候…</p>}

      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        rows={12}
        placeholder={'7-ELEVEN\n總計: 180\n日期: 2026/02/12'}
        className="mt-4 w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

      <div className="mt-3 flex gap-2">
        <button onClick={onSave} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          解析並儲存
        </button>
        <button onClick={() => setOcrText('')} className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">
          清空
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
    </section>
  )
}

function BillsPage({ bills }: { bills: Bill[] }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">帳單列表</h2>
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
                <td className="px-3 py-6 text-stone-500" colSpan={4}>尚無帳單資料。</td>
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
  )
}

function SettingsPage({ onClear }: { onClear: () => void }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">設定</h2>
      <p className="mt-2 text-sm text-stone-600">清除本機資料、查看隱私原則與 iOS 對齊說明。</p>
      <button onClick={onClear} className="mt-4 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
        清空本機帳單資料
      </button>
    </section>
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MicrophoneIcon, HomeIcon, CameraIcon, ReceiptPercentIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'
import { create } from 'zustand'

type Bill = {
  id: string
  merchantName: string
  amount: number
  date?: string
  category: string
  rawText: string
}

type Store = {
  bills: Bill[]
  ocrText: string
  setOcrText: (v: string) => void
  addBill: (bill: Bill) => void
  clearBills: () => void
  hydrate: () => void
}

const STORAGE_KEY = 'ai-receipt-manager-bills'

const useBillStore = create<Store>((set, get) => ({
  bills: [],
  ocrText: '',
  setOcrText: (v) => set({ ocrText: v }),
  addBill: (bill) => {
    const next = [bill, ...get().bills]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    set({ bills: next })
  },
  clearBills: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ bills: [] })
  },
  hydrate: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      set({ bills: JSON.parse(raw) as Bill[] })
    } catch {
      set({ bills: [] })
    }
  },
}))

const amountRegex = /(total|總計|小計)\s*[:：]?\s*(?:nt\$|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gim
const dateRegex = /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/

function parseReceipt(rawText: string) {
  let amount = 0
  for (const m of rawText.matchAll(amountRegex)) {
    amount = Number((m[2] ?? '0').replaceAll(',', '')) || amount
  }
  const merchantName = rawText.split('\n').map((v) => v.trim()).find(Boolean) ?? 'Unknown Merchant'
  const date = rawText.match(dateRegex)?.[0]
  const source = rawText.toLowerCase()
  const category = source.includes('uber') || source.includes('車隊') ? '交通' : source.includes('7-eleven') || source.includes('全家') ? '飲食' : '未分類'
  return { amount, merchantName, date, category }
}

function useSpeech(setText: (v: string) => void) {
  const [listening, setListening] = useState(false)

  const start = () => {
    const Recognition = (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition
    if (!Recognition) return alert('此瀏覽器不支援 Web Speech API')
    const recognition = new Recognition()
    recognition.lang = 'zh-TW'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? ''
      setText(transcript)
    }
    recognition.start()
  }

  return { start, listening }
}

function App() {
  const { bills, ocrText, setOcrText, addBill, clearBills, hydrate } = useBillStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const totals = useMemo(() => ({ count: bills.length, total: bills.reduce((s, b) => s + b.amount, 0) }), [bills])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const worker = await createWorker(['chi_tra', 'eng'])
      const ret = await worker.recognize(file)
      setOcrText(ret.data.text)
      await worker.terminate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR 失敗')
    } finally {
      setLoading(false)
    }
  }

  const saveBill = () => {
    if (!ocrText.trim()) return setError('請先輸入或辨識文字')
    const p = parseReceipt(ocrText)
    if (!p.amount) return setError('找不到總計金額')
    addBill({ id: crypto.randomUUID(), merchantName: p.merchantName, amount: p.amount, date: p.date, category: p.category, rawText: ocrText })
    setOcrText('')
    setError('')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f2f2f7] text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">AIReceiptManager</p>
          <h1 className="text-2xl font-semibold">iOS 風格帳單管家</h1>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
          <Routes>
            <Route path="/" element={<HomePage count={totals.count} total={totals.total} />} />
            <Route path="/scan" element={<ScanPage ocrText={ocrText} setOcrText={setOcrText} onDrop={onDrop} onSave={saveBill} loading={loading} error={error} />} />
            <Route path="/bills" element={<BillsPage bills={bills} />} />
            <Route path="/settings" element={<SettingsPage onClear={clearBills} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto grid max-w-4xl grid-cols-4 gap-1 px-3 py-2 text-xs">
            <Tab to="/" label="首頁" icon={<HomeIcon className="h-5 w-5" />} />
            <Tab to="/scan" label="掃描" icon={<CameraIcon className="h-5 w-5" />} />
            <Tab to="/bills" label="帳單" icon={<ReceiptPercentIcon className="h-5 w-5" />} />
            <Tab to="/settings" label="設定" icon={<Cog6ToothIcon className="h-5 w-5" />} />
          </div>
        </nav>
      </div>
    </BrowserRouter>
  )
}

function Tab({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => `rounded-xl px-2 py-1.5 text-center ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}>
      <div className="flex justify-center">{icon}</div>
      <div className="mt-1 text-[11px] font-medium">{label}</div>
    </NavLink>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">{children}</motion.section>
}

function HomePage({ count, total }: { count: number; total: number }) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">技術檢查完成</h2>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
          <li>• Tailwind + Framer Motion + Heroicons</li>
          <li>• react-dropzone 上傳</li>
          <li>• Web Speech API 語音輸入</li>
          <li>• Zustand + localStorage 假資料儲存</li>
        </ul>
      </Card>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card><p className="text-sm text-slate-500">帳單筆數</p><p className="text-3xl font-bold">{count}</p></Card>
        <Card><p className="text-sm text-slate-500">總支出</p><p className="text-3xl font-bold">NT$ {total.toLocaleString()}</p></Card>
      </div>
    </div>
  )
}

function ScanPage({ ocrText, setOcrText, onDrop, onSave, loading, error }: { ocrText: string; setOcrText: (v: string) => void; onDrop: (files: File[]) => Promise<void>; onSave: () => void; loading: boolean; error: string }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false })
  const speech = useSpeech(setOcrText)

  return (
    <Card>
      <h2 className="text-lg font-semibold">掃描帳單</h2>
      <div {...getRootProps()} className={`mt-3 rounded-2xl border-2 border-dashed p-6 text-center text-sm ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
        <input {...getInputProps()} />
        拖曳圖片到這裡，或點擊上傳
      </div>
      {loading && <p className="mt-2 text-sm text-amber-700">OCR 辨識中...</p>}

      <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} rows={10} className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="OCR 文字會在這裡" />

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={onSave} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">解析並儲存</button>
        <button onClick={speech.start} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-sm"><MicrophoneIcon className="h-4 w-4" /> {speech.listening ? '錄音中...' : '語音輸入'}</button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </Card>
  )
}

function BillsPage({ bills }: { bills: Bill[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">帳單列表</h2>
      <div className="mt-3 space-y-2">
        {bills.length === 0 ? <p className="text-sm text-slate-500">尚無資料</p> : bills.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-200 p-3">
            <div className="font-medium">{b.merchantName}</div>
            <div className="text-sm text-slate-600">{b.category} · NT$ {b.amount.toLocaleString()} · {b.date ?? '-'}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SettingsPage({ onClear }: { onClear: () => void }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">設定</h2>
      <p className="mt-2 text-sm text-slate-600">隱私優先：所有原型資料皆儲存在本機。</p>
      <button onClick={onClear} className="mt-4 rounded-xl border border-rose-300 px-4 py-2 text-sm text-rose-700">清空本機資料</button>
    </Card>
  )
}

export default App

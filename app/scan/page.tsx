'use client'

import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'
import { MicrophoneIcon } from '@heroicons/react/24/outline'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { parseReceipt } from '@/lib/receipt'
import { useBillStore } from '@/lib/store'

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
    recognition.onresult = (e: any) => setText(e.results?.[0]?.[0]?.transcript ?? '')
    recognition.start()
  }

  return { start, listening }
}

export default function ScanPage() {
  const { ocrText, setOcrText, addBill, hydrate, hydrated } = useBillStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

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

    addBill({
      id: crypto.randomUUID(),
      merchantName: p.merchantName,
      amount: p.amount,
      date: p.date,
      category: p.category,
      rawText: ocrText,
    })

    setOcrText('')
    setError('')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  const speech = useSpeech(setOcrText)

  return (
    <AppShell title="掃描帳單">
      <Card>
        <div
          {...getRootProps()}
          className={`mt-1 rounded-2xl border-2 border-dashed p-6 text-center text-sm ${
            isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          拖曳圖片到這裡，或點擊上傳
        </div>

        {loading && <p className="mt-2 text-sm text-amber-700">OCR 辨識中...</p>}

        <textarea
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          rows={10}
          className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm"
          placeholder="OCR 文字會在這裡"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={saveBill} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            解析並儲存
          </button>
          <button
            onClick={speech.start}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            <MicrophoneIcon className="h-4 w-4" />
            {speech.listening ? '錄音中...' : '語音輸入'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      </Card>
    </AppShell>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { SparklesIcon } from '@heroicons/react/24/outline'
import AnimatedPage from '@/components/AnimatedPage'
import BottomSheet from '@/components/BottomSheet'
import IOSNavBar from '@/components/IOSNavBar'
import { AppButton } from '@/components/buttons'
import { Skeleton, Shimmer } from '@/components/Skeleton'
import { classifyMerchant, parseReceiptText } from '@/lib/mockAI'
import { useBillsStore } from '@/store/useBillsStore'

const sampleText = `7-ELEVEN 市府門市
日期: 2026/02/12
拿鐵咖啡 85
鮪魚飯糰 45
Total: 130`

export default function ScanPage() {
  const addBill = useBillsStore((s) => s.addBill)

  const [ocrText, setOcrText] = useState('')
  const [progress, setProgress] = useState(0)
  const [isParsing, setIsParsing] = useState(false)
  const [showSheet, setShowSheet] = useState(false)

  const parsed = useMemo(() => (ocrText ? parseReceiptText(ocrText) : null), [ocrText])

  const runMockFlow = (text: string) => {
    setProgress(0)
    setIsParsing(true)
    setOcrText('')

    let p = 0
    const timer = setInterval(() => {
      p += 12
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(timer)
        setOcrText(text)
        setTimeout(() => {
          setIsParsing(false)
          setShowSheet(true)
        }, 500)
      }
    }, 120)
  }

  const onDrop = (files: File[]) => {
    const file = files[0]
    if (!file) return
    runMockFlow(`Uploaded Receipt\nMerchant: ${file.name.replace(/\..+$/, '')}\nDate: 2026/02/12\nTotal: 260`)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  const onSave = () => {
    if (!parsed) return
    addBill({
      id: crypto.randomUUID(),
      merchantName: parsed.merchantName,
      category: classifyMerchant(parsed.merchantName),
      total: parsed.total || 120,
      date: parsed.date,
      ocrText,
      createdAt: new Date().toISOString(),
    })
    setShowSheet(false)
  }

  return (
    <>
      <IOSNavBar title="Scan" />
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
          <section className="ios-card p-5">
            <div
              {...getRootProps()}
              className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition ${isDragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-300 bg-gradient-to-b from-slate-50 to-white'}`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto mb-4 h-44 w-full max-w-sm rounded-2xl border border-slate-300 bg-black/80" />
              <p className="text-sm text-slate-600">Drop receipt image here / tap to upload</p>
            </div>

            <div className="mt-4 flex gap-2">
              <AppButton onClick={() => runMockFlow(sampleText)}>Use sample receipt</AppButton>
              <AppButton variant="secondary">Upload Receipt</AppButton>
            </div>

            {isParsing ? (
              <div className="mt-4 space-y-3">
                <Shimmer className="h-2 w-full" />
                <div className="text-xs text-slate-500">Scanning... {progress}%</div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            ) : null}

            {ocrText ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">{ocrText}</div>
                {parsed ? (
                  <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                    <div>Merchant: {parsed.merchantName}</div>
                    <div>Date: {new Date(parsed.date).toLocaleDateString()}</div>
                    <div>Total: NT$ {parsed.total.toLocaleString()}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </AnimatedPage>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div className="space-y-3 pb-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            <SparklesIcon className="h-4 w-4" /> On-Device Classification
          </div>
          <h3 className="text-lg font-semibold">Confirm & Save</h3>
          <p className="text-sm text-slate-600">We parsed the receipt locally. Save this bill to your ledger?</p>
          <div className="flex gap-2">
            <AppButton variant="secondary" onClick={() => setShowSheet(false)}>Cancel</AppButton>
            <AppButton onClick={onSave}>Save Bill</AppButton>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

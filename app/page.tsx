'use client'

import { useEffect, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { useBillStore } from '@/lib/store'

export default function HomePage() {
  const { bills, hydrate, hydrated } = useBillStore()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  const total = useMemo(() => bills.reduce((s, b) => s + b.amount, 0), [bills])

  return (
    <AppShell title="iOS 風格帳單管家">
      <div className="space-y-4">
        <Card>
          <h2 className="text-lg font-semibold">已切換 Next.js</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>• Next.js App Router</li>
            <li>• Tailwind + Framer Motion + Heroicons</li>
            <li>• react-dropzone + Web Speech API</li>
            <li>• Zustand + localStorage</li>
          </ul>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-slate-500">帳單筆數</p>
            <p className="text-3xl font-bold">{bills.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">總支出</p>
            <p className="text-3xl font-bold">NT$ {total.toLocaleString()}</p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

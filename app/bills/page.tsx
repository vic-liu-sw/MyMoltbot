'use client'

import { useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { useBillStore } from '@/lib/store'

export default function BillsPage() {
  const { bills, hydrate, hydrated } = useBillStore()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  return (
    <AppShell title="帳單列表">
      <Card>
        <div className="space-y-2">
          {bills.length === 0 ? (
            <p className="text-sm text-slate-500">尚無資料</p>
          ) : (
            bills.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200 p-3">
                <div className="font-medium">{b.merchantName}</div>
                <div className="text-sm text-slate-600">
                  {b.category} · NT$ {b.amount.toLocaleString()} · {b.date ?? '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </AppShell>
  )
}

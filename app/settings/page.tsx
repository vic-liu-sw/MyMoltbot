'use client'

import AppShell from '@/components/AppShell'
import Card from '@/components/Card'
import { useBillStore } from '@/lib/store'

export default function SettingsPage() {
  const clearBills = useBillStore((s) => s.clearBills)

  return (
    <AppShell title="設定">
      <Card>
        <p className="text-sm text-slate-600">隱私優先：資料僅存放在本機 localStorage（原型）。</p>
        <button
          onClick={clearBills}
          className="mt-4 rounded-xl border border-rose-300 px-4 py-2 text-sm text-rose-700"
        >
          清空本機資料
        </button>
      </Card>
    </AppShell>
  )
}

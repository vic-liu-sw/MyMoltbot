'use client'

import AnimatedPage from '@/components/AnimatedPage'
import IOSNavBar from '@/components/IOSNavBar'
import { useBillsStore } from '@/store/useBillsStore'

export default function InsightsPage() {
  const bills = useBillsStore((s) => s.bills)
  const total = bills.reduce((s, b) => s + b.total, 0)
  const byCategory = bills.reduce<Record<string, number>>((acc, b) => {
    acc[b.category] = (acc[b.category] ?? 0) + b.total
    return acc
  }, {})

  const topMerchants = [...bills]
    .sort((a, b) => b.total - a.total)
    .slice(0, 4)

  const trend = [12, 18, 14, 22, 16, 20, 24]

  return (
    <>
      <IOSNavBar title="Insights" />
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
          <section className="ios-card p-5">
            <h3 className="text-lg font-semibold">Category Spend</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(byCategory).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-sm"><span>{k}</span><span>NT$ {v.toLocaleString()}</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-800" style={{ width: `${(v / Math.max(total, 1)) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="ios-card p-5">
            <h3 className="text-lg font-semibold">7-Day Trend</h3>
            <div className="mt-3 flex items-end gap-2 h-24">
              {trend.map((n, i) => <div key={i} className="w-6 rounded-t-xl bg-slate-800/80" style={{ height: `${n * 3}px` }} />)}
            </div>
          </section>

          <section className="ios-card p-5">
            <h3 className="text-lg font-semibold">Top Merchants</h3>
            <div className="mt-3 space-y-2 text-sm">
              {topMerchants.map((m) => <div key={m.id} className="flex justify-between"><span>{m.merchantName}</span><span>NT$ {m.total.toLocaleString()}</span></div>)}
            </div>
          </section>
        </div>
      </AnimatedPage>
    </>
  )
}

'use client'

import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import AnimatedPage from '@/components/AnimatedPage'
import BillCard from '@/components/BillCard'
import IOSNavBar from '@/components/IOSNavBar'
import { useBillsStore } from '@/store/useBillsStore'

export default function DashboardPage() {
  const bills = useBillsStore((s) => s.bills)
  const recentSavedId = useBillsStore((s) => s.recentSavedId)
  const clearRecentSaved = useBillsStore((s) => s.clearRecentSaved)

  const monthTotal = bills.reduce((sum, b) => sum + b.total, 0)

  useEffect(() => {
    if (!recentSavedId) return
    const t = setTimeout(() => clearRecentSaved(), 1800)
    return () => clearTimeout(t)
  }, [recentSavedId, clearRecentSaved])

  return (
    <>
      <IOSNavBar title="Bills" />
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
          <section className="ios-card bg-gradient-to-br from-white to-slate-50 p-5">
            <div className="text-sm text-slate-500">This Month</div>
            <div className="mt-2 text-4xl font-semibold tracking-tight">NT$ {monthTotal.toLocaleString()}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">On-Device · Privacy First</div>
          </section>

          <section className="space-y-3">
            <AnimatePresence>
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} highlight={bill.id === recentSavedId} />
              ))}
            </AnimatePresence>
          </section>
        </div>
      </AnimatedPage>
    </>
  )
}

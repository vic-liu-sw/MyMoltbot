'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AnimatedPage from '@/components/AnimatedPage'
import IOSNavBar from '@/components/IOSNavBar'
import Pill from '@/components/Pill'
import { AppButton } from '@/components/buttons'
import { useBillsStore } from '@/store/useBillsStore'

const categories = ['飲食', '交通', '生活', '辦公', '其他'] as const

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const bills = useBillsStore((s) => s.bills)
  const updateBill = useBillsStore((s) => s.updateBill)
  const deleteBill = useBillsStore((s) => s.deleteBill)

  const bill = useMemo(() => bills.find((b) => b.id === id), [bills, id])
  const [notes, setNotes] = useState(bill?.notes ?? '')

  if (!bill) return <div className="p-6">Bill not found</div>

  return (
    <>
      <IOSNavBar title="Bill" back />
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
          <section className="ios-card p-5">
            <div className="text-sm text-slate-500">{new Date(bill.date).toLocaleDateString()}</div>
            <h2 className="mt-1 text-2xl font-semibold">{bill.merchantName}</h2>
            <div className="mt-2 text-3xl font-semibold">NT$ {bill.total.toLocaleString()}</div>
            <div className="mt-3"><Pill tone={bill.category} /></div>
          </section>

          <section className="ios-card divide-y divide-slate-100 overflow-hidden">
            <Row label="Merchant">
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={bill.merchantName} onChange={(e) => updateBill(bill.id, { merchantName: e.target.value })} />
            </Row>
            <Row label="Category">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => updateBill(bill.id, { category: c })}><Pill tone={c} className={bill.category === c ? 'ring-2 ring-slate-300' : ''} /></button>
                ))}
              </div>
            </Row>
            <Row label="Date">
              <input type="date" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={new Date(bill.date).toISOString().slice(0,10)} onChange={(e) => updateBill(bill.id, { date: new Date(e.target.value).toISOString() })} />
            </Row>
            <Row label="Notes">
              <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Row>
          </section>

          <div className="flex gap-2">
            <AppButton variant="danger" onClick={() => { deleteBill(bill.id); router.push('/') }}>Delete</AppButton>
            <AppButton onClick={() => { updateBill(bill.id, { notes }); router.push('/') }}>Save</AppButton>
          </div>
        </div>
      </AnimatedPage>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </div>
  )
}

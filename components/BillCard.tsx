'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import Pill from './Pill'
import type { Bill } from '@/store/useBillsStore'

export default function BillCard({ bill, highlight }: { bill: Bill; highlight?: boolean }) {
  return (
    <Link href={`/bill/${bill.id}`}>
      <motion.article
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow ${highlight ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'}`}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
            <BuildingStorefrontIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-slate-900">{bill.merchantName}</div>
            <div className="mt-0.5 text-xs text-slate-500">{new Date(bill.date).toLocaleDateString()}</div>
            <div className="mt-2"><Pill tone={bill.category} /></div>
          </div>
          <div className="text-right text-lg font-semibold text-slate-900">NT$ {bill.total.toLocaleString()}</div>
        </div>
      </motion.article>
    </Link>
  )
}

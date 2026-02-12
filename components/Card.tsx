'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function Card({ children }: { children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      {children}
    </motion.section>
  )
}

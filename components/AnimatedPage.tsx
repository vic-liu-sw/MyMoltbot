'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

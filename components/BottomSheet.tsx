'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export default function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl rounded-t-3xl bg-white p-4 shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 320 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 130) onClose()
            }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

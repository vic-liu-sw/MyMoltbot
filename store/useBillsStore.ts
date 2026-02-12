'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BillCategory } from '@/lib/mockAI'

export type Bill = {
  id: string
  merchantName: string
  category: BillCategory
  total: number
  date: string
  ocrText: string
  notes?: string
  createdAt: string
}

type BillsState = {
  bills: Bill[]
  recentSavedId?: string
  addBill: (bill: Bill) => void
  updateBill: (id: string, patch: Partial<Bill>) => void
  deleteBill: (id: string) => void
  clearRecentSaved: () => void
}

const seedBills: Bill[] = [
  {
    id: 'seed-1',
    merchantName: '7-ELEVEN 市府門市',
    category: '飲食',
    total: 165,
    date: new Date().toISOString(),
    ocrText: '7-ELEVEN\n總計 165',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    merchantName: '台灣大車隊',
    category: '交通',
    total: 240,
    date: new Date(Date.now() - 86400000).toISOString(),
    ocrText: '台灣大車隊\nTotal 240',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const useBillsStore = create<BillsState>()(
  persist(
    (set) => ({
      bills: seedBills,
      recentSavedId: undefined,
      addBill: (bill) => set((s) => ({ bills: [bill, ...s.bills], recentSavedId: bill.id })),
      updateBill: (id, patch) => set((s) => ({ bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      deleteBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),
      clearRecentSaved: () => set({ recentSavedId: undefined }),
    }),
    {
      name: 'ios-bills-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

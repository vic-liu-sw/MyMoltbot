import { create } from 'zustand'

export type Bill = {
  id: string
  merchantName: string
  amount: number
  date?: string
  category: string
  rawText: string
}

type BillStore = {
  bills: Bill[]
  ocrText: string
  hydrated: boolean
  setOcrText: (v: string) => void
  hydrate: () => void
  addBill: (bill: Bill) => void
  clearBills: () => void
}

const STORAGE_KEY = 'ai-receipt-manager-bills'

export const useBillStore = create<BillStore>((set, get) => ({
  bills: [],
  ocrText: '',
  hydrated: false,
  setOcrText: (v) => set({ ocrText: v }),
  hydrate: () => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return set({ hydrated: true })
    try {
      set({ bills: JSON.parse(raw) as Bill[], hydrated: true })
    } catch {
      set({ bills: [], hydrated: true })
    }
  },
  addBill: (bill) => {
    const next = [bill, ...get().bills]
    set({ bills: next })
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  },
  clearBills: () => {
    set({ bills: [] })
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  },
}))

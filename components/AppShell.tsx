'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { CameraIcon, Cog6ToothIcon, HomeIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline'

const tabs = [
  { href: '/', label: '首頁', icon: HomeIcon },
  { href: '/scan', label: '掃描', icon: CameraIcon },
  { href: '/bills', label: '帳單', icon: ReceiptPercentIcon },
  { href: '/settings', label: '設定', icon: Cog6ToothIcon },
]

export default function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-xl">
        <p className="text-xs font-semibold tracking-widest text-emerald-700">AIReceiptManager · Next.js</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-4xl grid-cols-4 gap-1 px-3 py-2 text-xs">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-2 py-1.5 text-center ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}
              >
                <div className="flex justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-1 text-[11px] font-medium">{label}</div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChartBarIcon, Cog6ToothIcon, HomeIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline'

const tabs = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/scan', label: 'Scan', icon: ViewfinderCircleIcon },
  { href: '/insights', label: 'Insights', icon: ChartBarIcon },
  { href: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

export default function IOSTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1 px-3 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className="group rounded-2xl p-1 text-center">
              <div className={`mx-auto flex h-7 w-10 items-center justify-center rounded-xl transition ${active ? 'bg-slate-900 text-white' : 'text-slate-500 group-hover:bg-slate-100'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className={`mt-1 text-[11px] ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

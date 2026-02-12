'use client'

import { ChevronRightIcon, CloudIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline'
import AnimatedPage from '@/components/AnimatedPage'
import IOSNavBar from '@/components/IOSNavBar'

const rows = [
  { title: 'Privacy', subtitle: 'On-device OCR / Classification', icon: LockClosedIcon },
  { title: 'iCloud Sync', subtitle: 'Enabled (Mock)', icon: CloudIcon },
  { title: 'Siri Shortcuts', subtitle: '「記下這張帳單」(Mock)', icon: SparklesIcon },
]

export default function SettingsPage() {
  return (
    <>
      <IOSNavBar title="Settings" />
      <AnimatedPage>
        <div className="mx-auto max-w-3xl px-4 py-4">
          <section className="ios-card overflow-hidden">
            {rows.map((r) => (
              <div key={r.title} className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-b-0">
                <div className="rounded-xl bg-slate-100 p-2"><r.icon className="h-5 w-5 text-slate-700" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.subtitle}</div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </section>
        </div>
      </AnimatedPage>
    </>
  )
}

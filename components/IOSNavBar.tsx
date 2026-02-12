'use client'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function IOSNavBar({ title, back }: { title: string; back?: boolean }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 pt-2 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl pb-3 pt-1">
        <div className="flex items-center gap-2">
          {back ? (
            <button
              onClick={() => router.back()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:scale-95"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          ) : null}
          <h1 className="text-[34px] font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
      </div>
    </header>
  )
}

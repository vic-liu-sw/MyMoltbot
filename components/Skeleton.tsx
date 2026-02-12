import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-slate-200', className)} />
}

export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={clsx('relative overflow-hidden rounded-xl bg-slate-200/80', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  )
}

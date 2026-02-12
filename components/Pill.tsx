import { cva } from 'class-variance-authority'
import clsx from 'clsx'

const pillStyles = cva('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border', {
  variants: {
    tone: {
      飲食: 'bg-orange-50 text-orange-700 border-orange-200',
      交通: 'bg-sky-50 text-sky-700 border-sky-200',
      生活: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      辦公: 'bg-violet-50 text-violet-700 border-violet-200',
      其他: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  },
  defaultVariants: { tone: '其他' },
})

export default function Pill({ tone, className }: { tone: '飲食' | '交通' | '生活' | '辦公' | '其他'; className?: string }) {
  return <span className={clsx(pillStyles({ tone }), className)}>{tone}</span>
}

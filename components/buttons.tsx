import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

const button = cva('inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]', {
  variants: {
    variant: {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
    },
  },
  defaultVariants: { variant: 'primary' },
})

export function AppButton({ className, variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  return <button className={clsx(button({ variant }), className)} {...props} />
}

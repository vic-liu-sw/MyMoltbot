import './globals.css'
import type { ReactNode } from 'react'
import IOSTabBar from '@/components/IOSTabBar'

export const metadata = {
  title: 'AI Receipt Manager Prototype',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="min-h-screen bg-[#f2f2f7] pb-24">{children}</div>
        <IOSTabBar />
      </body>
    </html>
  )
}

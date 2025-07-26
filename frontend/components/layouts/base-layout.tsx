"use client"

import type { ReactNode } from "react"

interface BaseLayoutProps {
  children: ReactNode
  header: ReactNode
  sidebar?: ReactNode
  footer: ReactNode
}

export function BaseLayout({ children, header, sidebar, footer }: BaseLayoutProps) {
  return (
    <div className="relative bg-gray-50 h-screen">
      {/* Header */}
      <div className="h-16 fixed top-0 left-0 right-0 z-50">{header}</div>

      <div className="absolute top-18 bottom-12 left-0 right-0 flex">
        {/* Sidebar */}
        {sidebar && <aside className="w-64 bg-white shadow-sm border-r hidden lg:block h-full flex-shrink-0">{sidebar}</aside>}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Footer */}
      <div className="h-12 fixed bottom-0 left-0 right-0 z-50">{footer}</div>
    </div>
  )
}

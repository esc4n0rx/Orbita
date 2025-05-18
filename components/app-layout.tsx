import type React from "react"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  title?: string
}

export function AppLayout({ children, showHeader = true, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      {showHeader && (
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-bold">{title || "Orbita"}</h1>
            <UserNav />
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
      <MobileNav />
    </div>
  )
}

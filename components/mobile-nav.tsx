"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard, ListTodo, Settings, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tarefas",
      href: "/tasks",
      icon: ListTodo,
    },
    {
      name: "Calendário",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {/* <Link href="/dashboard" className="flex flex-col items-center justify-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              pathname === "/dashboard" ? "bg-yellow-400/10" : "",
            )}
          >
            <Star className={cn("h-5 w-5", pathname === "/dashboard" ? "text-yellow-400" : "text-slate-400")} />
          </div>
          <span className="mt-1 text-[10px] font-medium text-slate-400">Orbita</span>
        </Link> */}

        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                pathname === item.href ? "bg-cyan-500/10" : "",
              )}
            >
              <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-cyan-500" : "text-slate-400")} />
            </div>
            <span className="mt-1 text-[10px] font-medium text-slate-400">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

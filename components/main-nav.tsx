import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, ListTodo, Settings, Star } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      {/* <Link href="/dashboard" className="flex items-center space-x-2">
        <Star className="h-6 w-6 text-yellow-400" />
        <span className="hidden font-bold sm:inline-block">Orbita</span>
      </Link> */}
      <nav className="hidden gap-6 md:flex">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="flex items-center gap-1 text-sm font-medium">
            <ListTodo className="h-4 w-4" />
            <span>Tarefas</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/calendar" className="flex items-center gap-1 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Calendário</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings" className="flex items-center gap-1 text-sm font-medium">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
}

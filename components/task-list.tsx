"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Task = {
  id: string
  title: string
  completed: boolean
  category: string
  dueTime?: string
  xp: number
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Revisar apresentação do projeto",
    completed: false,
    category: "trabalho",
    dueTime: "14:00",
    xp: 50,
  },
  {
    id: "2",
    title: "Estudar React Hooks por 30 minutos",
    completed: false,
    category: "estudo",
    dueTime: "16:30",
    xp: 30,
  },
  {
    id: "3",
    title: "Fazer 20 minutos de meditação",
    completed: true,
    category: "saúde",
    xp: 20,
  },
  {
    id: "4",
    title: "Responder emails pendentes",
    completed: false,
    category: "trabalho",
    dueTime: "12:00",
    xp: 15,
  },
  {
    id: "5",
    title: "Ler capítulo do livro",
    completed: false,
    category: "lazer",
    xp: 25,
  },
]

const categoryColors: Record<string, string> = {
  trabalho: "bg-cyan-500 hover:bg-cyan-600",
  estudo: "bg-purple-500 hover:bg-purple-600",
  saúde: "bg-green-500 hover:bg-green-600",
  lazer: "bg-yellow-500 hover:bg-yellow-600",
}

// Adicionar o parâmetro filterStatus para filtrar tarefas
export function TaskList({
  expanded = false,
  filterStatus,
}: { expanded?: boolean; filterStatus?: "pending" | "completed" | "recurring" }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  // Filtrar tarefas com base no status
  let filteredTasks = tasks

  if (filterStatus === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed)
  } else if (filterStatus === "completed") {
    filteredTasks = tasks.filter((task) => task.completed)
  } else if (filterStatus === "recurring") {
    // Simulando tarefas recorrentes (na implementação real, você teria um campo para isso)
    filteredTasks = tasks.filter((task) => task.id === "3" || task.id === "5")
  }

  const displayTasks = expanded ? filteredTasks : filteredTasks.filter((task) => !task.completed).slice(0, 3)

  return (
    <div className="space-y-4">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center justify-between space-x-2 rounded-md border p-3 transition-colors ${
            task.completed ? "border-slate-800 bg-slate-900/50 text-slate-400" : "border-slate-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor={`task-${task.id}`} className={`font-medium ${task.completed ? "line-through" : ""}`}>
                {task.title}
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {task.dueTime && (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {task.dueTime}
                  </span>
                )}
                <Badge variant="secondary" className={`${categoryColors[task.category] || "bg-slate-500"} text-white`}>
                  {task.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {task.xp} XP
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Adiar</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      {!expanded && filteredTasks.filter((task) => !task.completed).length > 3 && (
        <Button variant="ghost" className="w-full justify-start text-slate-400">
          <Plus className="mr-2 h-4 w-4" />
          Ver mais {filteredTasks.filter((task) => !task.completed).length - 3} tarefas
        </Button>
      )}
    </div>
  )
}

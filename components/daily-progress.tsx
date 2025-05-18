"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type TimeBlock = {
  id: string
  time: string
  activity: string
  category: string
  completed: boolean
}

const initialTimeBlocks: TimeBlock[] = [
  {
    id: "1",
    time: "08:00 - 09:00",
    activity: "Café da manhã e planejamento do dia",
    category: "rotina",
    completed: true,
  },
  {
    id: "2",
    time: "09:00 - 10:30",
    activity: "Trabalho em projeto prioritário",
    category: "trabalho",
    completed: true,
  },
  {
    id: "3",
    time: "10:30 - 11:00",
    activity: "Pausa para café e alongamento",
    category: "pausa",
    completed: true,
  },
  {
    id: "4",
    time: "11:00 - 12:30",
    activity: "Reunião de equipe",
    category: "trabalho",
    completed: false,
  },
  {
    id: "5",
    time: "12:30 - 13:30",
    activity: "Almoço",
    category: "rotina",
    completed: false,
  },
  {
    id: "6",
    time: "13:30 - 15:00",
    activity: "Estudo de React",
    category: "estudo",
    completed: false,
  },
  {
    id: "7",
    time: "15:00 - 15:30",
    activity: "Pausa para lanche",
    category: "pausa",
    completed: false,
  },
  {
    id: "8",
    time: "15:30 - 17:00",
    activity: "Trabalho em tarefas pendentes",
    category: "trabalho",
    completed: false,
  },
]

const categoryColors: Record<string, string> = {
  trabalho: "bg-cyan-500",
  estudo: "bg-purple-500",
  rotina: "bg-slate-500",
  pausa: "bg-green-500",
  lazer: "bg-yellow-500",
}

export function DailyProgress() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks)

  const completedPercentage = Math.round(
    (timeBlocks.filter((block) => block.completed).length / timeBlocks.length) * 100,
  )

  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentTimeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Progresso de hoje</h4>
          <p className="text-xs text-slate-400">
            {timeBlocks.filter((block) => block.completed).length} de {timeBlocks.length} blocos concluídos
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{completedPercentage}%</p>
          <p className="text-xs text-slate-400">Agora: {currentTimeString}</p>
        </div>
      </div>
      <Progress value={completedPercentage} className="h-2" />
      <div className="space-y-2 pt-2">
        {timeBlocks.map((block) => (
          <div
            key={block.id}
            className={`flex items-center rounded-md border p-2 ${
              block.completed ? "border-slate-800 bg-slate-900/50 text-slate-400" : "border-slate-800"
            }`}
          >
            <div className="mr-3 w-24 text-xs font-medium">{block.time}</div>
            <div className="flex-1">
              <p className={`text-sm ${block.completed ? "line-through" : ""}`}>{block.activity}</p>
            </div>
            <Badge
              variant="secondary"
              className={`ml-2 ${categoryColors[block.category] || "bg-slate-500"} text-white`}
            >
              {block.category}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

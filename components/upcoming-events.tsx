"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

type Event = {
  id: string
  title: string
  date: Date
  time?: string
  category: string
  description?: string
}

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Reunião de equipe",
    date: new Date(2023, 4, 15),
    time: "10:00",
    category: "trabalho",
    description: "Discussão sobre o progresso do projeto",
  },
  {
    id: "2",
    title: "Consulta médica",
    date: new Date(2023, 4, 18),
    time: "14:30",
    category: "saúde",
    description: "Checkup anual",
  },
  {
    id: "3",
    title: "Aula de yoga",
    date: new Date(2023, 4, 20),
    time: "18:00",
    category: "saúde",
  },
  {
    id: "4",
    title: "Entrega de relatório",
    date: new Date(2023, 4, 22),
    category: "trabalho",
    description: "Relatório mensal de atividades",
  },
  {
    id: "5",
    title: "Aniversário de amigo",
    date: new Date(2023, 4, 25),
    time: "19:00",
    category: "lazer",
  },
]

const categoryColors: Record<string, string> = {
  trabalho: "bg-cyan-500",
  estudo: "bg-purple-500",
  saúde: "bg-green-500",
  lazer: "bg-yellow-500",
  rotina: "bg-slate-500",
}

export function UpcomingEvents() {
  const [events] = useState<Event[]>(initialEvents)

  // Ordenar eventos por data
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Pegar apenas os próximos eventos (a partir de hoje)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = sortedEvents.filter((event) => event.date >= today).slice(0, 5)

  return (
    <div className="space-y-4">
      {upcomingEvents.length > 0 ? (
        <>
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={`${categoryColors[event.category] || "bg-slate-500"} text-white`}>
                    {event.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date.toLocaleDateString("pt-BR")}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
                {event.description && <p className="text-sm">{event.description}</p>}
              </div>
            </Card>
          ))}
          <Button variant="outline" className="w-full">
            Ver Todos os Eventos
          </Button>
        </>
      ) : (
        <p className="text-slate-400">Nenhum evento próximo.</p>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events] = useState<Event[]>(initialEvents)

  // Função para verificar se uma data tem eventos
  const hasEventOnDate = (date: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Função para obter eventos de uma data específica
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Eventos para a data selecionada
  const selectedDateEvents = date ? getEventsForDate(date) : []

  return (
    <div className="space-y-4">
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="rounded-md border border-slate-800 mx-auto"
          modifiers={{
            hasEvent: (date) => hasEventOnDate(date),
          }}
          modifiersClassNames={{
            hasEvent: "bg-cyan-900/20 font-bold text-cyan-400",
          }}
        />
      </div>
      <div>
        <h3 className="mb-4 font-medium">
          {date ? date.toLocaleDateString("pt-BR", { dateStyle: "full" }) : "Selecione uma data"}
        </h3>
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <Card key={event.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    {event.time && <p className="text-sm text-slate-400">{event.time}</p>}
                    {event.description && <p className="mt-1 text-sm">{event.description}</p>}
                  </div>
                  <Badge className={`${categoryColors[event.category] || "bg-slate-500"} text-white`}>
                    {event.category}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">Nenhum evento para esta data.</p>
        )}
      </div>
    </div>
  )
}

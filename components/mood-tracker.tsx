"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

type MoodEntry = {
  id: string
  date: Date
  text: string
  mood: string
  tags: string[]
}

const initialEntries: MoodEntry[] = [
  {
    id: "1",
    date: new Date(2023, 4, 15),
    text: "Hoje foi um dia produtivo. Consegui terminar a maior parte das tarefas que planejei e ainda tive tempo para uma caminhada à tarde.",
    mood: "produtivo",
    tags: ["trabalho", "exercício", "foco"],
  },
  {
    id: "2",
    date: new Date(2023, 4, 14),
    text: "Dia difícil para manter o foco. Muitas distrações e interrupções. Preciso encontrar um ambiente mais tranquilo para trabalhar amanhã.",
    mood: "distraído",
    tags: ["trabalho", "distração", "frustração"],
  },
]

const moodOptions = [
  { value: "produtivo", label: "Produtivo", color: "bg-green-500" },
  { value: "feliz", label: "Feliz", color: "bg-yellow-500" },
  { value: "ansioso", label: "Ansioso", color: "bg-orange-500" },
  { value: "cansado", label: "Cansado", color: "bg-blue-500" },
  { value: "distraído", label: "Distraído", color: "bg-purple-500" },
  { value: "frustrado", label: "Frustrado", color: "bg-red-500" },
]

const tagOptions = [
  "trabalho",
  "estudo",
  "exercício",
  "família",
  "amigos",
  "lazer",
  "foco",
  "distração",
  "frustração",
  "conquista",
]

export function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>(initialEntries)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [newEntry, setNewEntry] = useState({
    text: "",
    mood: "",
    tags: [] as string[],
  })

  const selectedDateEntry = entries.find(
    (entry) =>
      entry.date.getDate() === selectedDate.getDate() &&
      entry.date.getMonth() === selectedDate.getMonth() &&
      entry.date.getFullYear() === selectedDate.getFullYear(),
  )

  const handleMoodSelect = (mood: string) => {
    setNewEntry({ ...newEntry, mood })
  }

  const handleTagToggle = (tag: string) => {
    if (newEntry.tags.includes(tag)) {
      setNewEntry({
        ...newEntry,
        tags: newEntry.tags.filter((t) => t !== tag),
      })
    } else {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tag],
      })
    }
  }

  const handleSaveEntry = () => {
    if (!newEntry.text || !newEntry.mood) return

    const newEntryObj: MoodEntry = {
      id: Date.now().toString(),
      date: new Date(selectedDate),
      text: newEntry.text,
      mood: newEntry.mood,
      tags: newEntry.tags,
    }

    // Remove existing entry for the selected date if it exists
    const filteredEntries = entries.filter(
      (entry) =>
        !(
          entry.date.getDate() === selectedDate.getDate() &&
          entry.date.getMonth() === selectedDate.getMonth() &&
          entry.date.getFullYear() === selectedDate.getFullYear()
        ),
    )

    setEntries([...filteredEntries, newEntryObj])
    setNewEntry({
      text: "",
      mood: "",
      tags: [],
    })
  }

  const getMoodColor = (mood: string) => {
    const option = moodOptions.find((m) => m.value === mood)
    return option ? option.color : "bg-slate-500"
  }

  const getMoodLabel = (mood: string) => {
    const option = moodOptions.find((m) => m.value === mood)
    return option ? option.label : mood
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-4 text-sm font-medium">Calendário</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border mx-auto"
          locale={ptBR}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Entradas Recentes</h3>
        {entries.length > 0 ? (
          entries
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 3)
            .map((entry) => (
              <Card
                key={entry.id}
                className="cursor-pointer hover:bg-slate-900/50"
                onClick={() => setSelectedDate(new Date(entry.date))}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">{entry.date.toLocaleDateString("pt-BR")}</div>
                    <Badge className={`${getMoodColor(entry.mood)} text-white`}>{getMoodLabel(entry.mood)}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{entry.text}</p>
                </CardContent>
              </Card>
            ))
        ) : (
          <p className="text-sm text-slate-400">Nenhuma entrada ainda.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {selectedDateEntry
            ? "Editar entrada para " + selectedDate.toLocaleDateString("pt-BR")
            : "Nova entrada para " + selectedDate.toLocaleDateString("pt-BR")}
        </h3>
        <div className="space-y-2">
          <div className="text-sm font-medium">Como você se sentiu hoje?</div>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={(selectedDateEntry?.mood || newEntry.mood) === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleMoodSelect(option.value)}
                className={
                  (selectedDateEntry?.mood || newEntry.mood) === option.value ? `${option.color} text-white` : ""
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Descreva seu dia</div>
          <Textarea
            placeholder="Como foi seu dia? O que você fez? Como se sentiu?"
            value={selectedDateEntry?.text || newEntry.text}
            onChange={(e) => setNewEntry({ ...newEntry, text: e.target.value })}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Tags</div>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <Badge
                key={tag}
                variant={(selectedDateEntry?.tags || newEntry.tags).includes(tag) ? "default" : "outline"}
                className={`cursor-pointer ${
                  (selectedDateEntry?.tags || newEntry.tags).includes(tag) ? "bg-slate-700" : ""
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Button onClick={handleSaveEntry} className="w-full" disabled={!newEntry.mood || !newEntry.text}>
          {selectedDateEntry ? "Atualizar Entrada" : "Salvar Entrada"}
        </Button>
      </div>
    </div>
  )
}

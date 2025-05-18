"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, RotateCcw, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [settings, setSettings] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval as NodeJS.Timeout)
            setIsActive(false)
            // Aqui poderia ter um som de notificação
            return
          }
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    switch (mode) {
      case "work":
        setMinutes(settings.work)
        break
      case "shortBreak":
        setMinutes(settings.shortBreak)
        break
      case "longBreak":
        setMinutes(settings.longBreak)
        break
    }
    setSeconds(0)
  }

  const changeMode = (newMode: "work" | "shortBreak" | "longBreak") => {
    setIsActive(false)
    setMode(newMode)
    switch (newMode) {
      case "work":
        setMinutes(settings.work)
        break
      case "shortBreak":
        setMinutes(settings.shortBreak)
        break
      case "longBreak":
        setMinutes(settings.longBreak)
        break
    }
    setSeconds(0)
  }

  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    resetTimer()
  }

  const progress = ((settings[mode] * 60 - (minutes * 60 + seconds)) / (settings[mode] * 60)) * 100

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex w-full justify-center space-x-2">
        <Button
          variant={mode === "work" ? "default" : "outline"}
          size="sm"
          onClick={() => changeMode("work")}
          className={mode === "work" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
        >
          Trabalho
        </Button>
        <Button
          variant={mode === "shortBreak" ? "default" : "outline"}
          size="sm"
          onClick={() => changeMode("shortBreak")}
          className={mode === "shortBreak" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Pausa Curta
        </Button>
        <Button
          variant={mode === "longBreak" ? "default" : "outline"}
          size="sm"
          onClick={() => changeMode("longBreak")}
          className={mode === "longBreak" ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          Pausa Longa
        </Button>
      </div>

      <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-800">
        <svg className="absolute h-full w-full" viewBox="0 0 100 100">
          <circle className="stroke-slate-800" cx="50" cy="50" r="46" fill="transparent" strokeWidth="8" />
          <circle
            className={`${
              mode === "work" ? "stroke-cyan-600" : mode === "shortBreak" ? "stroke-green-600" : "stroke-purple-600"
            } transition-all duration-1000 ease-linear`}
            cx="50"
            cy="50"
            r="46"
            fill="transparent"
            strokeWidth="8"
            strokeDasharray="289.02652413026095"
            strokeDashoffset={289.02652413026095 * (1 - progress / 100)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="text-center">
          <div className="text-4xl font-bold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-slate-400">
            {mode === "work" ? "Foco" : mode === "shortBreak" ? "Pausa Curta" : "Pausa Longa"}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10 rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={toggleTimer}
          className={`h-12 w-12 rounded-full ${
            mode === "work"
              ? "bg-cyan-600 hover:bg-cyan-700"
              : mode === "shortBreak"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações do Pomodoro</DialogTitle>
              <DialogDescription>Ajuste os tempos para cada modo do Pomodoro.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="work" className="text-right">
                  Trabalho
                </Label>
                <Input
                  id="work"
                  type="number"
                  value={settings.work}
                  onChange={(e) => setSettings({ ...settings, work: Number(e.target.value) })}
                  min="1"
                  max="60"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shortBreak" className="text-right">
                  Pausa Curta
                </Label>
                <Input
                  id="shortBreak"
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({ ...settings, shortBreak: Number(e.target.value) })}
                  min="1"
                  max="30"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longBreak" className="text-right">
                  Pausa Longa
                </Label>
                <Input
                  id="longBreak"
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({ ...settings, longBreak: Number(e.target.value) })}
                  min="1"
                  max="60"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => updateSettings(settings)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

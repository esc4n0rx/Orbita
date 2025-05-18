"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function NotificationSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    taskReminders: true,
    dailySummary: true,
    weeklyReport: true,
    achievementNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
    reminderTime: "30min",
  })

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você adicionaria a lógica para salvar as configurações de notificação
    console.log("Configurações de notificação:", settings)

    toast({
      title: "Configurações salvas!",
      description: "Suas preferências de notificação foram atualizadas.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notificações de tarefas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-reminders">Lembretes de tarefas</Label>
              <p className="text-xs text-slate-400">Receba lembretes para tarefas próximas do prazo</p>
            </div>
            <Switch
              id="task-reminders"
              checked={settings.taskReminders}
              onCheckedChange={(checked) => handleSwitchChange("taskReminders", checked)}
            />
          </div>

          {settings.taskReminders && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="reminder-time">Tempo de antecedência</Label>
              <Select
                value={settings.reminderTime}
                onValueChange={(value) => handleSelectChange("reminderTime", value)}
              >
                <SelectTrigger className="w-full border-slate-800 bg-slate-950/50">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10min">10 minutos antes</SelectItem>
                  <SelectItem value="30min">30 minutos antes</SelectItem>
                  <SelectItem value="1hour">1 hora antes</SelectItem>
                  <SelectItem value="3hours">3 horas antes</SelectItem>
                  <SelectItem value="1day">1 dia antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-summary">Resumo diário</Label>
              <p className="text-xs text-slate-400">Receba um resumo das suas tarefas para o dia</p>
            </div>
            <Switch
              id="daily-summary"
              checked={settings.dailySummary}
              onCheckedChange={(checked) => handleSwitchChange("dailySummary", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-report">Relatório semanal</Label>
              <p className="text-xs text-slate-400">Receba um relatório do seu progresso semanal</p>
            </div>
            <Switch
              id="weekly-report"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => handleSwitchChange("weeklyReport", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievement-notifications">Conquistas</Label>
              <p className="text-xs text-slate-400">Receba notificações quando desbloquear conquistas</p>
            </div>
            <Switch
              id="achievement-notifications"
              checked={settings.achievementNotifications}
              onCheckedChange={(checked) => handleSwitchChange("achievementNotifications", checked)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Canais de notificação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email</Label>
              <p className="text-xs text-slate-400">Receba notificações por email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Notificações push</Label>
              <p className="text-xs text-slate-400">Receba notificações no navegador ou dispositivo</p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}

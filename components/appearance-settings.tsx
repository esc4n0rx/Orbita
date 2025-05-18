"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function AppearanceSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    theme: "dark",
    fontSize: 16,
    reduceMotion: true,
    highContrast: false,
  })

  const handleThemeChange = (value: string) => {
    setSettings((prev) => ({ ...prev, theme: value }))
  }

  const handleFontSizeChange = (value: number[]) => {
    setSettings((prev) => ({ ...prev, fontSize: value[0] }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você adicionaria a lógica para salvar as configurações de aparência
    console.log("Configurações de aparência:", settings)

    toast({
      title: "Configurações salvas!",
      description: "Suas preferências de aparência foram atualizadas.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tema</h3>
        <RadioGroup value={settings.theme} onValueChange={handleThemeChange} className="grid grid-cols-3 gap-4">
          <div>
            <RadioGroupItem value="light" id="light" className="sr-only" />
            <Label
              htmlFor="light"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-slate-800 bg-white p-4 hover:bg-slate-100 has-[:checked]:border-cyan-600"
            >
              <div className="mb-2 h-10 w-10 rounded-full bg-slate-900" />
              <span className="text-sm font-medium text-slate-900">Claro</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" className="sr-only" />
            <Label
              htmlFor="dark"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-cyan-600 bg-slate-900 p-4 hover:bg-slate-800"
            >
              <div className="mb-2 h-10 w-10 rounded-full bg-white" />
              <span className="text-sm font-medium">Escuro</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="system" id="system" className="sr-only" />
            <Label
              htmlFor="system"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-slate-800 bg-gradient-to-br from-white to-slate-900 p-4 hover:from-slate-100 hover:to-slate-800 has-[:checked]:border-cyan-600"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-white">
                <div className="h-4 w-4 rounded-full bg-white" />
              </div>
              <span className="text-sm font-medium">Sistema</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Tamanho da fonte</h3>
          <span className="text-sm text-slate-400">{settings.fontSize}px</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          min={12}
          max={24}
          step={1}
          onValueChange={handleFontSizeChange}
          className="py-4"
        />
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Menor</span>
          <span className="text-xs text-slate-400">Maior</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Acessibilidade</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion">Reduzir movimento</Label>
              <p className="text-xs text-slate-400">Diminui ou remove animações e transições</p>
            </div>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => handleSwitchChange("reduceMotion", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">Alto contraste</Label>
              <p className="text-xs text-slate-400">Aumenta o contraste entre elementos</p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSwitchChange("highContrast", checked)}
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

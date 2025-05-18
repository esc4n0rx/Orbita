"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function TaskForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    dueTime: "",
    xp: 20,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você adicionaria a lógica para salvar a tarefa
    console.log("Nova tarefa:", formData)

    toast({
      title: "Tarefa criada!",
      description: `A tarefa "${formData.title}" foi adicionada com sucesso.`,
    })

    // Limpar o formulário
    setFormData({
      title: "",
      description: "",
      category: "",
      dueDate: "",
      dueTime: "",
      xp: 20,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nome da tarefa"
          required
          className="border-slate-800 bg-slate-950/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detalhes da tarefa"
          className="border-slate-800 bg-slate-950/50"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
          <SelectTrigger className="border-slate-800 bg-slate-950/50">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trabalho">Trabalho</SelectItem>
            <SelectItem value="estudo">Estudo</SelectItem>
            <SelectItem value="saúde">Saúde</SelectItem>
            <SelectItem value="lazer">Lazer</SelectItem>
            <SelectItem value="rotina">Rotina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueTime">Hora</Label>
          <Input
            id="dueTime"
            name="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="xp">Pontos XP</Label>
        <Input
          id="xp"
          name="xp"
          type="number"
          min="5"
          max="100"
          step="5"
          value={formData.xp}
          onChange={handleChange}
          className="border-slate-800 bg-slate-950/50"
        />
        <p className="text-xs text-slate-400">Quanto mais desafiadora a tarefa, mais pontos você ganha!</p>
      </div>

      <Button type="submit" className="w-full">
        Adicionar Tarefa
      </Button>
    </form>
  )
}

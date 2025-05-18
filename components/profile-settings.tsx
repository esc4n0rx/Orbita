"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "Usuário",
    email: "usuario@exemplo.com",
    bio: "Desenvolvedor de software com TDAH, buscando melhorar minha produtividade e organização.",
    avatar: "/placeholder.svg?height=128&width=128",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você adicionaria a lógica para salvar as alterações do perfil
    console.log("Perfil atualizado:", formData)

    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
        <Avatar className="h-24 w-24">
          <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
          <AvatarFallback className="text-lg">
            {formData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-medium">{formData.name}</h3>
          <p className="text-sm text-slate-400">{formData.email}</p>
          <Button size="sm" variant="outline">
            Alterar foto
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
            rows={4}
          />
          <p className="text-xs text-slate-400">Breve descrição sobre você. Será exibida no seu perfil.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Alterar senha</h3>
        <div className="space-y-2">
          <Label htmlFor="current-password">Senha atual</Label>
          <Input id="current-password" type="password" className="border-slate-800 bg-slate-950/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input id="new-password" type="password" className="border-slate-800 bg-slate-950/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar nova senha</Label>
          <Input id="confirm-password" type="password" className="border-slate-800 bg-slate-950/50" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}

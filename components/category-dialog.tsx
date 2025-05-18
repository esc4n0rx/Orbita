"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  color: string
  count: number
}

const initialCategories: Category[] = [
  { id: "1", name: "trabalho", color: "bg-cyan-500", count: 5 },
  { id: "2", name: "estudo", color: "bg-purple-500", count: 3 },
  { id: "3", name: "saúde", color: "bg-green-500", count: 2 },
  { id: "4", name: "lazer", color: "bg-yellow-500", count: 1 },
  { id: "5", name: "rotina", color: "bg-slate-500", count: 4 },
]

const colorOptions = [
  { name: "Azul", value: "bg-cyan-500" },
  { name: "Roxo", value: "bg-purple-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Amarelo", value: "bg-yellow-500" },
  { name: "Cinza", value: "bg-slate-500" },
  { name: "Vermelho", value: "bg-red-500" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Rosa", value: "bg-pink-500" },
]

export function CategoryDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "bg-cyan-500",
  })
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      })
      return
    }

    if (editMode && editId) {
      // Atualizar categoria existente
      setCategories(
        categories.map((cat) =>
          cat.id === editId
            ? {
                ...cat,
                name: newCategory.name,
                color: newCategory.color,
              }
            : cat,
        ),
      )

      toast({
        title: "Categoria atualizada!",
        description: `A categoria "${newCategory.name}" foi atualizada com sucesso.`,
      })
    } else {
      // Adicionar nova categoria
      const newCat: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        color: newCategory.color,
        count: 0,
      }

      setCategories([...categories, newCat])

      toast({
        title: "Categoria adicionada!",
        description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`,
      })
    }

    // Resetar o formulário
    setNewCategory({
      name: "",
      color: "bg-cyan-500",
    })
    setEditMode(false)
    setEditId(null)
  }

  const handleEditCategory = (category: Category) => {
    setNewCategory({
      name: category.name,
      color: category.color,
    })
    setEditMode(true)
    setEditId(category.id)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))

    toast({
      title: "Categoria removida",
      description: "A categoria foi removida com sucesso.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <Badge key={category.id} className={`${category.color} text-white flex items-center gap-1 px-3 py-1`}>
            {category.name}
            <span className="ml-1 bg-black/20 rounded-full px-1.5 text-xs">{category.count}</span>
          </Badge>
        ))}
        <DialogTrigger asChild>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Badge>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Edite os detalhes da categoria." : "Adicione uma nova categoria para organizar suas tarefas."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria</Label>
            <Input
              id="category-name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Ex: Trabalho, Estudo, Lazer..."
              className="border-slate-800 bg-slate-950/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <div
                  key={color.value}
                  className={`h-8 rounded-md cursor-pointer ${color.value} ${
                    newCategory.color === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950" : ""
                  }`}
                  onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {!editMode && (
            <div className="space-y-2">
              <Label>Categorias Existentes</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-slate-800 p-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${category.color}`} />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {editMode && (
            <Button
              variant="outline"
              onClick={() => {
                setNewCategory({ name: "", color: "bg-cyan-500" })
                setEditMode(false)
                setEditId(null)
              }}
              className="mr-2"
            >
              Cancelar
            </Button>
          )}
          <Button onClick={handleAddCategory}>{editMode ? "Atualizar" : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

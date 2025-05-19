// components/category-dialog.tsx
"use client"

import { useState, useEffect } from "react"
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
import { Edit, Plus, Trash2, Loader2 } from "lucide-react"

type Category = {
  id: string
  nome: string
  cor: string
}

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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [newCategory, setNewCategory] = useState({
    nome: "",
    cor: "bg-cyan-500",
  })
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categorias');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar categorias');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editMode && editId) {
        // Atualizar categoria existente
        const response = await fetch(`/api/categorias/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar categoria');
        }
        
        const updatedCategory = await response.json();
        
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editId ? updatedCategory : cat
          )
        );

        toast({
          title: "Categoria atualizada!",
          description: `A categoria "${newCategory.nome}" foi atualizada com sucesso.`,
        });
      } else {
        // Adicionar nova categoria
        const response = await fetch('/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao criar categoria');
        }
        
        const newCategoryData = await response.json();
        
        setCategories([...categories, newCategoryData]);

        toast({
          title: "Categoria adicionada!",
          description: `A categoria "${newCategory.nome}" foi adicionada com sucesso.`,
        });
      }

      // Resetar o formulário
      setNewCategory({
        nome: "",
        cor: "bg-cyan-500",
      });
      setEditMode(false);
      setEditId(null);
      
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setNewCategory({
      nome: category.nome,
      cor: category.cor,
    });
    setEditMode(true);
    setEditId(category.id);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao remover categoria');
      }
      
      setCategories(categories.filter((cat) => cat.id !== id));

      toast({
        title: "Categoria removida",
        description: "A categoria foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap gap-2 mb-4">
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-slate-400">Carregando categorias...</span>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Badge key={category.id} className={`${category.cor} text-white flex items-center gap-1 px-3 py-1`}>
              {category.nome}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">Nenhuma categoria definida</span>
        )}
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
              value={newCategory.nome}
              onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
              placeholder="Ex: Trabalho, Estudo, Lazer..."
              className="border-slate-800 bg-slate-950/50"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <div
                  key={color.value}
                  className={`h-8 rounded-md cursor-pointer ${color.value} ${
                    newCategory.cor === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950" : ""
                  }`}
                  onClick={() => setNewCategory({ ...newCategory, cor: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          // components/category-dialog.tsx (continuação)
          {!editMode && (
            <div className="space-y-2">
              <Label>Categorias Existentes</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-slate-800 p-2">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${category.cor}`} />
                        <span className="text-sm">{category.nome}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditCategory(category)}
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-2">Nenhuma categoria cadastrada</p>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {editMode && (
            <Button
              variant="outline"
              onClick={() => {
                setNewCategory({ nome: "", cor: "bg-cyan-500" })
                setEditMode(false)
                setEditId(null)
              }}
              className="mr-2"
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleAddCategory}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMode ? "Atualizando..." : "Adicionando..."}
              </>
            ) : (
              editMode ? "Atualizar" : "Adicionar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
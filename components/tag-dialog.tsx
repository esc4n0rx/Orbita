// components/tag-dialog.tsx
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
import { Edit, Plus, Trash2, Loader2, Tag } from "lucide-react"

type TagItem = {
  id: string
  nome: string
}

export function TagDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState({
    nome: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar tags');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      toast({
        title: "Erro ao carregar tags",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da tag não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editMode && editId) {
        // Atualizar tag existente
        const response = await fetch(`/api/tags/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTag),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar tag');
        }
        
        const updatedTag = await response.json();
        
        setTags(prevTags => 
          prevTags.map(tag => 
            tag.id === editId ? updatedTag : tag
          )
        );

        toast({
          title: "Tag atualizada!",
          description: `A tag "${newTag.nome}" foi atualizada com sucesso.`,
        });
      } else {
        // Adicionar nova tag
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTag),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao criar tag');
        }
        
        const newTagData = await response.json();
        
        setTags([...tags, newTagData]);

        toast({
          title: "Tag adicionada!",
          description: `A tag "${newTag.nome}" foi adicionada com sucesso.`,
        });
      }

      // Resetar o formulário
      setNewTag({
        nome: "",
      });
      setEditMode(false);
      setEditId(null);
      
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tag.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag: TagItem) => {
    setNewTag({
      nome: tag.nome,
    });
    setEditMode(true);
    setEditId(tag.id);
  };

 // components/tag-dialog.tsx (continuação)
  const handleDeleteTag = async (id: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta tag?')) {
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao remover tag');
      }
      
      setTags(tags.filter((tag) => tag.id !== id));

      toast({
        title: "Tag removida",
        description: "A tag foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover tag:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a tag.",
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
            <span className="text-sm text-slate-400">Carregando tags...</span>
          </div>
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <Badge key={tag.id} className="bg-slate-700 text-white flex items-center gap-1 px-3 py-1">
              <Tag className="h-3 w-3 mr-1" />
              {tag.nome}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">Nenhuma tag definida</span>
        )}
        <DialogTrigger asChild>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
            <Plus className="h-3 w-3 mr-1" />
            Gerenciar Tags
          </Badge>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Tag" : "Gerenciar Tags"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Edite o nome da tag." : "Adicione ou remova tags para organizar suas tarefas."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Nome da Tag</Label>
            <div className="flex space-x-2">
              <Input
                id="tag-name"
                value={newTag.nome}
                onChange={(e) => setNewTag({ ...newTag, nome: e.target.value })}
                placeholder="Ex: Importante, Urgente, Projeto X..."
                className="border-slate-800 bg-slate-950/50 flex-1"
                disabled={loading}
              />
              <Button 
                onClick={handleAddTag}
                disabled={loading || !newTag.nome.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  editMode ? "Atualizar" : "Adicionar"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags Existentes</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-slate-800 p-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                </div>
              ) : tags.length > 0 ? (
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      <span className="text-sm">{tag.nome}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditTag(tag)}
                        disabled={loading}
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">Nenhuma tag cadastrada</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setNewTag({ nome: "" });
              setEditMode(false);
              setEditId(null);
            }}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
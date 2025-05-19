// components/task-form.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns'

type Category = {
  id: string;
  nome: string;
  cor: string;
}

type Tag = {
  id: string;
  nome: string;
}

type TaskFormProps = {
  taskId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ taskId, onSuccess }: TaskFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria_id: "",
    data_vencimento: format(new Date(), 'yyyy-MM-dd'),
    hora_vencimento: "",
    pontos_xp: 20,
    recorrente: false,
    padrao_recorrencia: "daily",
    prioridade: "media",
    tags: [] as string[],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Carregar categorias e tags ao montar o componente
  useEffect(() => {
    fetchCategoriesAndTags();
  }, []);

  // Carregar detalhes da tarefa se estiver em modo de edição
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchCategoriesAndTags = async () => {
    try {
      setLoadingInitial(true);

      // Buscar categorias
      const categoriesResponse = await fetch('/api/categorias');
      if (!categoriesResponse.ok) {
        throw new Error('Falha ao buscar categorias');
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Buscar tags
      const tagsResponse = await fetch('/api/tags');
      if (!tagsResponse.ok) {
        throw new Error('Falha ao buscar tags');
      }
      const tagsData = await tagsResponse.json();
      setTags(tagsData);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErrorMsg('Falha ao carregar dados necessários');
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um problema ao buscar categorias e tags",
        variant: "destructive",
      });
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      setLoadingInitial(true);
      const response = await fetch(`/api/tarefas/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar detalhes da tarefa');
      }
      
      const taskData = await response.json();

      // Adaptar estrutura de dados para o formulário
      setFormData({
        titulo: taskData.titulo,
        descricao: taskData.descricao || "",
        categoria_id: taskData.categoria_id || "",
        data_vencimento: taskData.data_vencimento,
        hora_vencimento: taskData.hora_vencimento || "",
        pontos_xp: taskData.pontos_xp,
        recorrente: taskData.recorrente || false,
        padrao_recorrencia: taskData.padrao_recorrencia || "daily",
        prioridade: taskData.prioridade || "media",
        // Extrair IDs das tags
        tags: taskData.tags ? taskData.tags.map((t: any) => t.tag_id.id) : [],
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes da tarefa:', error);
      setErrorMsg('Falha ao carregar detalhes da tarefa');
      toast({
        title: "Erro ao carregar tarefa",
        description: "Ocorreu um problema ao buscar os detalhes da tarefa",
        variant: "destructive",
      });
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const tagExists = prev.tags.includes(tagId);
      if (tagExists) {
        return {
          ...prev,
          tags: prev.tags.filter(id => id !== tagId)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tagId]
        };
      }
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recorrente: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Validar campos obrigatórios
      if (!formData.titulo || !formData.data_vencimento) {
        setErrorMsg('Título e data de vencimento são obrigatórios');
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      // Determinar URL e método da requisição
      const url = taskId 
        ? `/api/tarefas/${taskId}` 
        : '/api/tarefas';
      
      const method = taskId ? 'PUT' : 'POST';
      
      // Enviar dados para a API
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar tarefa');
      }
      
      const taskData = await response.json();
      
      toast({
        title: taskId ? "Tarefa atualizada!" : "Tarefa criada!",
        description: taskId 
          ? `A tarefa "${formData.titulo}" foi atualizada com sucesso.` 
          : `A tarefa "${formData.titulo}" foi adicionada com sucesso.`,
      });
      
      if (!taskId) {
        // Se for uma nova tarefa, limpar o formulário
        setFormData({
          titulo: "",
          descricao: "",
          categoria_id: "",
          data_vencimento: format(new Date(), 'yyyy-MM-dd'),
          hora_vencimento: "",
          pontos_xp: 20,
          recorrente: false,
          padrao_recorrencia: "daily",
          prioridade: "media",
          tags: [],
        });
      }
      
      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      setErrorMsg('Falha ao salvar tarefa');
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar a tarefa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-500" />
          <p className="mt-2 text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !formData.titulo && taskId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{errorMsg}</p>
        <Button onClick={fetchTaskDetails} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título<span className="text-red-500">*</span></Label>
        <Input
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Nome da tarefa"
          required
          className="border-slate-800 bg-slate-950/50"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Detalhes da tarefa"
          className="border-slate-800 bg-slate-950/50"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria_id">Categoria</Label>
        <Select 
          value={formData.categoria_id} 
          onValueChange={(value) => handleSelectChange("categoria_id", value)}
          disabled={loading}
        >
          <SelectTrigger className="border-slate-800 bg-slate-950/50">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${category.cor}`} />
                  <span>{category.nome}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_vencimento">Data<span className="text-red-500">*</span></Label>
          <Input
            id="data_vencimento"
            name="data_vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_vencimento">Hora</Label>
          <Input
            id="hora_vencimento"
            name="hora_vencimento"
            type="time"
            value={formData.hora_vencimento}
            onChange={handleChange}
            className="border-slate-800 bg-slate-950/50"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="recorrente">Tarefa recorrente</Label>
          <Switch 
            id="recorrente" 
            checked={formData.recorrente}
            onCheckedChange={handleSwitchChange}
            disabled={loading}
          />
        </div>
        
        {formData.recorrente && (
          <div className="mt-2">
            <Label htmlFor="padrao_recorrencia">Frequência</Label>
            <Select 
              value={formData.padrao_recorrencia} 
              onValueChange={(value) => handleSelectChange("padrao_recorrencia", value)}
              disabled={loading}
            >
              <SelectTrigger className="border-slate-800 bg-slate-950/50 mt-1">
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quinzenal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prioridade">Prioridade</Label>
        <Select 
          value={formData.prioridade} 
          onValueChange={(value) => handleSelectChange("prioridade", value)}
          disabled={loading}
        >
          <SelectTrigger className="border-slate-800 bg-slate-950/50">
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pontos_xp">Pontos XP</Label>
        <Input
          id="pontos_xp"
          name="pontos_xp"
          type="number"
          min="5"
          max="100"
          step="5"
          value={formData.pontos_xp}
          onChange={handleChange}
          className="border-slate-800 bg-slate-950/50"
          disabled={loading}
        />
        <p className="text-xs text-slate-400">Quanto mais desafiadora a tarefa, mais pontos você ganha!</p>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id={`tag-${tag.id}`} 
                  checked={formData.tags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                  disabled={loading}
                />
                <Label 
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm cursor-pointer"
                >
                  {tag.nome}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {taskId ? "Atualizando..." : "Adicionando..."}
          </>
        ) : (
          taskId ? "Atualizar Tarefa" : "Adicionar Tarefa"
        )}
      </Button>
    </form>
  )
}
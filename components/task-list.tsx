// components/task-list.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Task = {
  id: string
  titulo: string
  concluida: boolean
  categoria: {
    id: string
    nome: string
    cor: string
  }
  hora_vencimento?: string
  pontos_xp: number
  data_vencimento: string
  prioridade: string
  descricao?: string
  tags?: { tag_id: { id: string, nome: string } }[]
}

// Função para formatar a data
function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return dataStr;
  }
}

export function TaskList({
  expanded = false,
  filterStatus,
  selectedDate,
  filterCategoryId,
  filterTagId,
  onTaskUpdate,
}: { 
  expanded?: boolean; 
  filterStatus?: "pendente" | "concluida" | "recorrente";
  selectedDate?: Date;
  filterCategoryId?: string;
  filterTagId?: string;
  onTaskUpdate?: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Usar useCallback para evitar recriação da função a cada render
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL com parâmetros
      let url = '/api/tarefas?';
      
      if (selectedDate) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        url += `data=${formattedDate}&`;
      }
      
      if (filterStatus) {
        url += `status=${filterStatus}&`;
      }
      
      if (filterCategoryId) {
        url += `categoria_id=${filterCategoryId}&`;
      }
      
      if (filterTagId) {
        url += `tag_id=${filterTagId}&`;
      }
      
      // Remover o último '&' se existir
      url = url.endsWith('&') ? url.slice(0, -1) : url;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar tarefas');
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setError('Não foi possível carregar as tarefas');
      toast({
        title: "Erro ao carregar tarefas",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedDate, filterCategoryId, filterTagId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      // Encontrar a tarefa atual para poder fazer toggle
      const tarefa = tasks.find(task => task.id === taskId);
      
      if (!tarefa) return;
      
      const endpoint = tarefa.concluida 
        ? `/api/tarefas/${taskId}` 
        : `/api/tarefas/${taskId}/concluir`;
      
      const method = tarefa.concluida ? 'PUT' : 'PATCH';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefa.concluida 
          ? { ...tarefa, concluida: false } 
          : {}),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar tarefa');
      }
      
      // Atualizar estado local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, concluida: !task.concluida } 
          : task
      ));
      
      toast({
        title: tarefa.concluida ? "Tarefa desmarcada" : "Tarefa concluída!",
        description: tarefa.concluida 
          ? "A tarefa foi desmarcada como concluída" 
          : `Você ganhou ${tarefa.pontos_xp} pontos de XP!`,
      });
      
      // Recarregar tarefas para pegar mudanças do servidor (como tarefas recorrentes)
      setTimeout(() => {
        fetchTasks();
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Ocorreu um erro ao atualizar o status da tarefa",
        variant: "destructive",
      });
    }
  };

  const handleAdiarTarefa = async (taskId: string) => {
    try {
      // Abrir um prompt para o usuário informar a nova data
      const dataStr = prompt('Informe a nova data (DD/MM/AAAA):');
      
      if (!dataStr) return;
      
      // Converter para o formato ISO
      const partesData = dataStr.split('/');
      if (partesData.length !== 3) {
        toast({
          title: "Formato de data inválido",
          description: "Use o formato DD/MM/AAAA",
          variant: "destructive",
        });
        return;
      }
      
      const novaData = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
      
      const response = await fetch(`/api/tarefas/${taskId}/adiar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nova_data: novaData }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adiar tarefa');
      }
      
      toast({
        title: "Tarefa adiada",
        description: `A tarefa foi adiada para ${dataStr}`,
      });
      
      // Recarregar a lista de tarefas
      fetchTasks();
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Erro ao adiar tarefa:', error);
      toast({
        title: "Erro ao adiar tarefa",
        description: "Ocorreu um erro ao adiar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleDuplicarTarefa = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tarefas/${taskId}/duplicar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao duplicar tarefa');
      }
      
      toast({
        title: "Tarefa duplicada",
        description: "Uma cópia da tarefa foi criada",
      });
      
      // Recarregar a lista de tarefas
      fetchTasks();
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Erro ao duplicar tarefa:', error);
      toast({
        title: "Erro ao duplicar tarefa",
        description: "Ocorreu um erro ao duplicar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleRemoverTarefa = async (taskId: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
      }
      
      const response = await fetch(`/api/tarefas/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao remover tarefa');
      }
      
      // Atualizar estado local removendo a tarefa
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi removida com sucesso",
      });

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
      toast({
        title: "Erro ao remover tarefa",
        description: "Ocorreu um erro ao remover a tarefa",
        variant: "destructive",
      });
    }
  };

  // Filtrar tarefas com base no status (se necessário)
  let filteredTasks = tasks;

  // Determinar quais tarefas exibir (todas ou limitadas)
  const displayTasks = expanded ? filteredTasks : filteredTasks.filter((task) => !task.concluida).slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchTasks} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (displayTasks.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-400">Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center justify-between space-x-2 rounded-md border p-3 transition-colors ${
            task.concluida ? "border-slate-800 bg-slate-900/50 text-slate-400" : "border-slate-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.concluida}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor={`task-${task.id}`} className={`font-medium ${task.concluida ? "line-through" : ""}`}>
                {task.titulo}
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {task.hora_vencimento && (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {task.hora_vencimento}
                  </span>
                )}
                <Badge 
                  variant="secondary" 
                  className={`${task.categoria?.cor || "bg-slate-500"} text-white`}
                >
                  {task.categoria?.nome || "sem categoria"}
                </Badge>
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {task.pontos_xp} XP
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = `/tarefas/editar/${task.id}`}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdiarTarefa(task.id)}>
                Adiar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicarTarefa(task.id)}>
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => handleRemoverTarefa(task.id)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      {!expanded && filteredTasks.filter((task) => !task.concluida).length > 3 && (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400"
          onClick={() => window.location.href = '/tarefas'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ver mais {filteredTasks.filter((task) => !task.concluida).length - 3} tarefas
        </Button>
      )}
    </div>
  )
}
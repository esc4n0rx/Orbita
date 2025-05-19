// app/tasks/tasks-content.tsx (modificado)
"use client";

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { AppLayout } from "@/components/app-layout"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { CategoryDialog } from "@/components/category-dialog"
import { TagDialog } from "@/components/tag-dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCheckAuth } from "@/hooks/use-check-auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

export default function TasksPageContent() {
  const { isAuthenticated} = useCheckAuth()
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState<Array<{id: string, nome: string, cor: string}>>([]);
  const [tags, setTags] = useState<Array<{id: string, nome: string}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [loadingFilters, setLoadingFilters] = useState(true)
  
  useEffect(() => {
    // Verificar autenticação
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  // Função para forçar atualização dos componentes
  const refreshComponents = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const fetchFilters = async () => {
    try {
      setLoadingFilters(true);
      
      // Buscar categorias
      const categoriesResponse = await fetch('/api/categorias');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
      
      // Buscar tags
      const tagsResponse = await fetch('/api/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Erro ao buscar filtros:', error);
    } finally {
      setLoadingFilters(false);
    }
  };
  
  // Limpar filtros
  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
  };
  
  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
          <p className="text-md text-slate-400">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  // Função para definir data atual
  const setToday = () => {
    setSelectedDate(new Date());
  };

  // Ir para o dia anterior
  const previousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  // Ir para o próximo dia
  const nextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  // Formatar a data selecionada
  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <AppLayout title="Tarefas">
      <div className="space-y-4 p-4 pb-20">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={previousDay}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={nextDay}>
              Próximo
            </Button>
            <Button variant="default" size="sm" onClick={setToday}>
              Hoje
            </Button>
          </div>
          <div className="text-sm font-medium capitalize">{formattedDate}</div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre suas tarefas por categoria ou tag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  disabled={loadingFilters}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/50">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
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
              
              <div className="flex-1">
                <Select 
                  value={selectedTag} 
                  onValueChange={setSelectedTag}
                  disabled={loadingFilters}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/50">
                    <SelectValue placeholder="Selecionar tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={clearFilters}
                disabled={!selectedCategory && !selectedTag}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar filtros</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
            <TabsTrigger value="recorrente">Recorrentes</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organização</CardTitle>
                <CardDescription>Organize suas tarefas com categorias e tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Categorias</h4>
                  <CategoryDialog key={`cat-${refreshKey}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <TagDialog key={`tag-${refreshKey}`} />
                </div>
              </CardContent>
            </Card>
            
            <TaskList 
              key={`all-${refreshKey}`}
              expanded={true} 
              selectedDate={selectedDate}
              filterCategoryId={selectedCategory}
              filterTagId={selectedTag}
              onTaskUpdate={refreshComponents}
            />
          </TabsContent>
          
          {/* Atualizar as outras abas para usar os filtros */}
          <TabsContent value="pendente" className="space-y-4">
            <TaskList 
              key={`pendente-${refreshKey}`}
              expanded={true} 
              filterStatus="pendente" 
              selectedDate={selectedDate}
              filterCategoryId={selectedCategory}
              filterTagId={selectedTag}
              onTaskUpdate={refreshComponents}
            />
          </TabsContent>
          
          <TabsContent value="concluida" className="space-y-4">
            <TaskList 
              key={`concluida-${refreshKey}`}
              expanded={true} 
              filterStatus="concluida" 
              selectedDate={selectedDate}
              filterCategoryId={selectedCategory}
              filterTagId={selectedTag}
              onTaskUpdate={refreshComponents}
            />
          </TabsContent>
          
          <TabsContent value="recorrente" className="space-y-4">
            <TaskList 
              key={`recorrente-${refreshKey}`}
              expanded={true} 
              filterStatus="recorrente" 
              selectedDate={selectedDate}
              filterCategoryId={selectedCategory}
              filterTagId={selectedTag}
              onTaskUpdate={refreshComponents}
            />
          </TabsContent>
        </Tabs>

        <NewTaskDialog onTaskAdded={refreshComponents} />
      </div>
    </AppLayout>
  )
}
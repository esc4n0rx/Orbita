"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { AppLayout } from "@/components/app-layout"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { CategoryDialog } from "@/components/category-dialog"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function TasksPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Verificar autenticação
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
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

  return (
    <AppLayout title="Tarefas">
      <div className="space-y-4 p-4 pb-20">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organize suas tarefas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDialog />
              </CardContent>
            </Card>
            <TaskList expanded={true} />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <TaskList expanded={true} filterStatus="pending" />
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <TaskList expanded={true} filterStatus="completed" />
          </TabsContent>
          <TabsContent value="recurring" className="space-y-4">
            <TaskList expanded={true} filterStatus="recurring" />
          </TabsContent>
        </Tabs>

        <NewTaskDialog />
      </div>
    </AppLayout>
  )
}
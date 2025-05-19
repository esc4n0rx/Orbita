// app/tarefas/editar/[id]/edit-task-content.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/app-layout"
import { TaskForm } from "@/components/task-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function EditTaskPage({ id }: { id: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    router.push('/tarefas');
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
          <p className="text-md text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Editar Tarefa">
      <div className="space-y-4 p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Editar Tarefa</CardTitle>
            <CardDescription>Atualize os detalhes da tarefa</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm taskId={id} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
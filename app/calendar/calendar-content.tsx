"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"
import { UpcomingEvents } from "@/components/upcoming-events"
import { AppLayout } from "@/components/app-layout"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function CalendarPageContent() {
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
          <p className="text-md text-slate-400">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Calendário">
      <div className="space-y-4 p-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Dia
            </Button>
            <Button variant="outline" size="sm">
              Semana
            </Button>
            <Button variant="default" size="sm">
              Mês
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Visualize e gerencie seus compromissos</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos agendados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingEvents />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
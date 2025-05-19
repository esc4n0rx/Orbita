// app/dashboard/dashboard-content.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { Overview } from "@/components/overview"
import { AppLayout } from "@/components/app-layout"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchAPI } from "@/lib/api";
import { Era, format, LocaleDayPeriod, LocalizeFnOptions, Quarter } from "date-fns"
import {
  ChevronDown,
  ChevronUp,
  CalendarClock,
  Check,
  Star,
  Award,
  Clock,
  Flame
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [statData, setStatData] = useState<any>(null);
  const [statLoading, setStatLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [todayDate] = useState(new Date());
  
  // Função para forçar atualização dos componentes
  const refreshComponents = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchStatistics();
  }, []);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("Não autenticado, redirecionando para login");
        router.push('/');
      } else {
        console.log("Usuário autenticado, permanecendo no dashboard");
        // Carregar estatísticas
        fetchStatistics();
      }
    }
  }, [user, loading, router]);

  const fetchStatistics = async () => {
    try {
      setStatLoading(true);
      const data = await fetchAPI('/api/estatisticas');
      setStatData(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Configurar dados padrão em caso de erro
      setStatData({
        stats: {
          tarefas_concluidas: 0,
          tarefas_pendentes: 0,
          total_pontos_xp: 0
        },
        usuario: {
          nome: user?.email || "Usuário",
          nivel: 1,
          pontos_xp: 0,
          proximo_nivel_xp: 100,
          sequencia_dias: 0
        },
        grafico: []
      });
    } finally {
      setStatLoading(false);
    }
  };

  // Calcular a porcentagem de tarefas concluídas
  const getCompletionPercentage = () => {
    if (!statData?.stats) return 0;
    
    const total = (statData.stats.tarefas_concluidas || 0) + (statData.stats.tarefas_pendentes || 0);
    if (total === 0) return 0;
    
    return Math.round((statData.stats.tarefas_concluidas / total) * 100);
  };

  // Calcular a porcentagem de progresso para o próximo nível
  const getLevelProgressPercentage = () => {
    if (!statData?.usuario) return 0;
    
    const { pontos_xp, proximo_nivel_xp } = statData.usuario;
    
    if (!pontos_xp || !proximo_nivel_xp) return 0;
    
    // Calcular o início do nível atual
    let nivelAtualXp = 0;
    const nivel = statData.usuario.nivel || 1;
    
    if (nivel === 1) {
      nivelAtualXp = 0;
    } else if (nivel === 2) {
      nivelAtualXp = 101;
    } else if (nivel === 3) {
      nivelAtualXp = 251;
    } else if (nivel === 4) {
      nivelAtualXp = 501;
    } else if (nivel === 5) {
      nivelAtualXp = 1001;
    } else if (nivel === 6) {
      nivelAtualXp = 2001;
    } else if (nivel === 7) {
      nivelAtualXp = 4001;
    } else if (nivel === 8) {
      nivelAtualXp = 7001;
    } else if (nivel === 9) {
      nivelAtualXp = 10001;
    } else {
      nivelAtualXp = 15001 + (nivel - 10) * 5000;
    }
    
    const xpNesseNivel = pontos_xp - nivelAtualXp;
    const xpParaProximo = proximo_nivel_xp - nivelAtualXp;
    
    return Math.round((xpNesseNivel / xpParaProximo) * 100);
  };

  // Formatar a data atual
  const formattedDate = format(
    todayDate,
    "EEEE, dd 'de' MMMM", 
    { locale: { localize: {
      day: n => ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][n],
      month: n => ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][n],
      ordinalNumber: function (value: number, options?: LocalizeFnOptions): string {
        throw new Error("Function not implemented.");
      },
      era: function (value: Era, options?: LocalizeFnOptions): string {
        throw new Error("Function not implemented.");
      },
      quarter: function (value: Quarter, options?: LocalizeFnOptions): string {
        throw new Error("Function not implemented.");
      },
      dayPeriod: function (value: LocaleDayPeriod, options?: LocalizeFnOptions): string {
        throw new Error("Function not implemented.");
      }
    }, formatLong: {} as any, options: {} } }
  );

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4 p-4 pb-20">
        {/* Cabeçalho com data e saudação */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white capitalize">{formattedDate}</h2>
                <p className="text-slate-300 text-sm">
                  {statLoading ? (
                    "Carregando..."
                  ) : (
                    <>
                      <span>Olá, {statData?.usuario?.nome || "Usuário"}</span>
                      {statData?.stats?.tarefas_pendentes > 0 && (
                        <span> • {statData.stats.tarefas_pendentes} tarefas pendentes hoje</span>
                      )}
                    </>
                  )}
                </p>
              </div>
              
              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <div className="flex items-center bg-slate-800 rounded-md p-2 text-white">
                  <Flame className="h-4 w-4 text-amber-400 mr-1.5" />
                  <span className="text-sm font-medium">{statData?.usuario?.sequencia_dias || 0} dias seguidos</span>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-white border-slate-700 hover:bg-slate-700"
                  onClick={() => setShowPomodoro(!showPomodoro)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Pomodoro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pomodoro Timer (colapsável) */}
        {showPomodoro && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Pomodoro Timer</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setShowPomodoro(false)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PomodoroTimer />
            </CardContent>
          </Card>
        )}
        
        {/* Progresso e nível */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cartão de progresso de nível */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Nível e Progresso</CardTitle>
                <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-md">
                  <Award className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-yellow-400">Nível {statData?.usuario?.nivel || 1}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>XP: {statData?.usuario?.pontos_xp || 0}</span>
                  <span>Próximo: {statData?.usuario?.proximo_nivel_xp || 100}</span>
                </div>
                <Progress 
                  value={getLevelProgressPercentage()} 
                  className="h-2 bg-slate-200/10" 
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Pontos para o próximo nível: {
                      statData?.usuario 
                        ? statData.usuario.proximo_nivel_xp - statData.usuario.pontos_xp 
                        : 0
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cartão de progresso de tarefas */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tarefas Concluídas</CardTitle>
                <div className="flex items-center bg-cyan-500/10 px-2 py-1 rounded-md">
                  <Check className="h-4 w-4 text-cyan-400 mr-1" />
                  <span className="text-sm font-medium text-cyan-400">
                    {statData?.stats?.tarefas_concluidas || 0}/
                    {(statData?.stats?.tarefas_concluidas || 0) + (statData?.stats?.tarefas_pendentes || 0)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress 
                  value={getCompletionPercentage()} 
                  className="h-2 bg-slate-200/10" 
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {getCompletionPercentage()}% concluído
                  </span>
                  <span>
                    Total: {statData?.stats?.total_pontos_xp || 0} XP ganhos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Progresso Semanal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Progresso Semanal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Overview key={`overview-${refreshKey}`} />
          </CardContent>
        </Card>
        
        {/* Tarefas de Hoje */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tarefas de Hoje</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/tarefas')}
                className="text-xs h-8"
              >
                Ver todas
              </Button>
            </div>
            <CardDescription>
              {statLoading ? (
                "Carregando tarefas..."
              ) : (
                statData?.stats?.tarefas_pendentes > 0 
                  ? `Você tem ${statData.stats.tarefas_pendentes} tarefas pendentes hoje` 
                  : "Sem tarefas pendentes para hoje"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList 
              key={`dash-tasks-${refreshKey}`}
              selectedDate={new Date()}
              onTaskUpdate={refreshComponents}
            />
          </CardContent>
        </Card>

        {/* Botão flutuante para adicionar novas tarefas */}
        <NewTaskDialog onTaskAdded={refreshComponents} />
      </div>
    </AppLayout>
  )
}
// components/overview.tsx
"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UserStorage } from "@/lib/token-service"

type ChartData = {
  name: string;
  data: string;
  tarefas: number;
  concluidas: number;
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = UserStorage.getUserId();
      if (!userId) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        return;
      }
      
      const response = await fetch('/api/estatisticas', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          UserStorage.clearUser();
          setError('Sessão expirada. Por favor, faça login novamente.');
          return;
        }
        throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
      }
      
      const estatisticas = await response.json();
      
      if (estatisticas.grafico && Array.isArray(estatisticas.grafico)) {
        setData(estatisticas.grafico);
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      setError('Não foi possível carregar o gráfico');
      toast({
        title: "Erro ao carregar gráfico",
        description: "Não foi possível obter os dados de estatísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[250px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-500" />
          <p className="mt-2 text-sm text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="flex h-[250px] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">{error || 'Nenhum dado disponível'}</p>
          <button 
            onClick={fetchData}
            className="mt-2 rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-800" vertical={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-slate-400">Tarefas</span>
                      <span className="font-bold text-cyan-500">{payload[0].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-slate-400">Concluídas</span>
                      <span className="font-bold text-yellow-500">{payload[1].value}</span>
                    </div>
                  </div>
                </div>
              )
            }

            return null
          }}
        />
        <Bar dataKey="tarefas" fill="#38BDF8" radius={[4, 4, 0, 0]} className="fill-cyan-500" />
        <Bar dataKey="concluidas" fill="#FACC15" radius={[4, 4, 0, 0]} className="fill-yellow-500" />
      </BarChart>
    </ResponsiveContainer>
  )
}
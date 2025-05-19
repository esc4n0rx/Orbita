// app/api/estatisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

// GET /api/estatisticas - Obter estatísticas do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar estatísticas do usuário
    const { data: statsData, error: statsError } = await supabase
      .rpc('orbita_estatisticas_usuario', { usuario_uuid: userId });
    
    if (statsError) throw statsError;
    
    // Buscar dados do perfil (nível, xp, etc)
    const { data: userData, error: userError } = await supabase
      .from('orbita_usuarios')
      .select('pontos_xp, nivel, proximo_nivel_xp, sequencia_dias')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Buscar contagem de tarefas por categoria
    const { data: categoriasData, error: categoriasError } = await supabase
      .from('orbita_tarefas')
      .select(`
        categoria:categoria_id(id, nome, cor),
        count:id
      `, { count: 'exact', head: false })
      .eq('usuario_id', userId)
      .not('categoria_id', 'is', null);
    
    if (categoriasError) throw categoriasError;
    
    // Buscar tarefas concluídas nos últimos 7 dias
    const dataAtual = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 7);
    
    const { data: tarefasDiarias, error: tarefasDiariasError } = await supabase
      .from('orbita_tarefas')
      .select('data_vencimento, concluida')
      .eq('usuario_id', userId)
      .gte('data_vencimento', dataInicio.toISOString().split('T')[0])
      .lte('data_vencimento', dataAtual.toISOString().split('T')[0])
      .order('data_vencimento', { ascending: true });
    
    if (tarefasDiariasError) throw tarefasDiariasError;
    
    // Contar tarefas por dia
    const tarefasPorDia: { [data: string]: { total: number; concluidas: number } } = {};
    tarefasDiarias.forEach(tarefa => {
      if (!tarefasPorDia[tarefa.data_vencimento]) {
        tarefasPorDia[tarefa.data_vencimento] = { total: 0, concluidas: 0 };
      }
      
      tarefasPorDia[tarefa.data_vencimento].total++;
      
      if (tarefa.concluida) {
        tarefasPorDia[tarefa.data_vencimento].concluidas++;
      }
    });
    
    // Formatar dados para gráfico
    const ultimosDias = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(dataAtual);
      data.setDate(data.getDate() - i);
      const dataFormatada = data.toISOString().split('T')[0];
      
      const nomeDia = new Date(dataFormatada).toLocaleDateString('pt-BR', { weekday: 'short' });
      
      ultimosDias.unshift({
        name: nomeDia,
        data: dataFormatada,
        tarefas: tarefasPorDia[dataFormatada]?.total || 0,
        concluidas: tarefasPorDia[dataFormatada]?.concluidas || 0
      });
    }
    
    return NextResponse.json({
      stats: statsData,
      usuario: userData,
      categorias: categoriasData,
      grafico: ultimosDias
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
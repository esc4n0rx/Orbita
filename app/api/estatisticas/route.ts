// app/api/estatisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar dados do perfil (nível, xp, etc)
    const { data: userData, error: userError } = await supabase
      .from('orbita_usuarios')
      .select('pontos_xp, nivel, proximo_nivel_xp, sequencia_dias, nome, email')
      .eq('id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // Ignora erro de "não encontrado"
      throw userError;
    }
    
    // Valores padrão para usuários novos
    const defaultUserData = {
      pontos_xp: 0,
      nivel: 1,
      proximo_nivel_xp: 100,
      sequencia_dias: 0,
      nome: "Usuário",
      email: "",
    };
    
    // Valores padrão para estatísticas
    const defaultStats = {
      tarefas_concluidas: 0,
      tarefas_pendentes: 0,
      total_pontos_xp: 0
    };
    
    // Buscar estatísticas do usuário (tratando caso em que não há dados)
    let statsData = defaultStats;
    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('orbita_estatisticas_usuario', { usuario_uuid: userId });
      
      if (!statsError && stats) {
        statsData = stats;
      }
    } catch (error) {
      console.log('Erro ao buscar estatísticas, usando valores padrão:', error);
    }
    
    // Gerar gráfico vazio para novos usuários
    const ultimosDias = [];
    const dataAtual = new Date();
    for (let i = 6; i >= 0; i--) {
      const data = new Date(dataAtual);
      data.setDate(data.getDate() - i);
      const dataFormatada = data.toISOString().split('T')[0];
      
      const nomeDia = new Date(dataFormatada).toLocaleDateString('pt-BR', { weekday: 'short' });
      
      ultimosDias.push({
        name: nomeDia,
        data: dataFormatada,
        tarefas: 0,
        concluidas: 0
      });
    }
    
    return NextResponse.json({
      stats: statsData,
      usuario: userData || defaultUserData,
      categorias: [],
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
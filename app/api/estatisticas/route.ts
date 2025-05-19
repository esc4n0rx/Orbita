// app/api/estatisticas/route.ts (continuação)
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
    const userQuery = `
      SELECT pontos_xp, nivel, proximo_nivel_xp, sequencia_dias, nome, email 
      FROM orbita_usuarios 
      WHERE id = $1
    `;
    
    const { data: userData, error: userError } = await supabase.rpc('execute_sql_query', {
      sql_query: userQuery,
      params: [userId]
    });
    
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
    
    // Buscar estatísticas do usuário
    let statsData = defaultStats;
    try {
      const statsQuery = `
        SELECT 
          COUNT(CASE WHEN concluida = true THEN 1 END) as tarefas_concluidas,
          COUNT(CASE WHEN concluida = false THEN 1 END) as tarefas_pendentes,
          COALESCE(SUM(CASE WHEN concluida = true THEN pontos_xp ELSE 0 END), 0) as total_pontos_xp
        FROM orbita_tarefas
        WHERE usuario_id = $1 AND data_vencimento = CURRENT_DATE
      `;
      
      const { data: stats, error: statsError } = await supabase.rpc('execute_sql_query', {
        sql_query: statsQuery,
        params: [userId]
      });
      
      if (!statsError && stats && stats.length > 0) {
        statsData = stats[0];
      }
    } catch (error) {
      console.log('Erro ao buscar estatísticas, usando valores padrão:', error);
    }
    
    // Gerar dados para o gráfico semanal
    const graficoQuery = `
      WITH dias AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS data_dia
      )
      SELECT 
        TO_CHAR(d.data_dia, 'Dy') as name,
        TO_CHAR(d.data_dia, 'YYYY-MM-DD') as data,
        COUNT(t.id) as tarefas,
        COUNT(CASE WHEN t.concluida = true THEN 1 END) as concluidas
      FROM 
        dias d
      LEFT JOIN 
        orbita_tarefas t ON d.data_dia = t.data_vencimento AND t.usuario_id = $1
      GROUP BY 
        d.data_dia
      ORDER BY 
        d.data_dia
    `;
    
    const { data: graficoData, error: graficoError } = await supabase.rpc('execute_sql_query', {
      sql_query: graficoQuery,
      params: [userId]
    });
    
    if (graficoError) {
      console.error('Erro ao gerar dados do gráfico:', graficoError);
    }
    
    // Caso não tenha conseguido gerar os dados do gráfico, criar array vazio
    const ultimosDias = graficoData || [];
    
    // Buscar categorias do usuário
    const categoriasQuery = `
      SELECT id, nome, cor
      FROM orbita_categorias
      WHERE usuario_id = $1
      ORDER BY nome
    `;
    
    const { data: categoriasData, error: categoriasError } = await supabase.rpc('execute_sql_query', {
      sql_query: categoriasQuery,
      params: [userId]
    });
    
    if (categoriasError) {
      console.error('Erro ao buscar categorias:', categoriasError);
    }
    
    // Montar resposta
    return NextResponse.json({
      stats: statsData,
      usuario: userData && userData.length > 0 ? userData[0] : defaultUserData,
      categorias: categoriasData || [],
      grafico: ultimosDias
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas', details: errorMessage },
      { status: 500 }
    );
  }
}
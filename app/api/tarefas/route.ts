// app/api/tarefas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

// GET /api/tarefas - Listar tarefas com filtros por data, status, etc.
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get('data');
    const status = searchParams.get('status'); // pendente, concluida, todas
    const categoriaId = searchParams.get('categoria_id');
    const tagId = searchParams.get('tag_id');
    
    // Chamar a função que retorna tarefas
    const { data: tarefas, error } = await supabase
      .rpc('orbita_obter_tarefas', {
        usuario_uuid: userId,
        data_filtro: data || null,
        status_filtro: status || null,
        categoria_id_filtro: categoriaId || null,
        tag_id_filtro: tagId || null
      });
    
    if (error) throw error;
    
    return NextResponse.json(tarefas || []);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
      { status: 500 }
    );
  }
}

// POST /api/tarefas - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { 
      titulo, 
      descricao, 
      categoria_id,
      data_vencimento,
      hora_vencimento,
      pontos_xp,
      recorrente,
      padrao_recorrencia,
      prioridade,
      tags
    } = await request.json();
    
    if (!titulo || !data_vencimento) {
      return NextResponse.json(
        { error: 'Título e data de vencimento são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Iniciar uma transação
    const { data: client } = await supabase.rpc('begin_transaction');
    
    try {
      // Inserir tarefa
      const insertQuery = `
        INSERT INTO orbita_tarefas (
          usuario_id, 
          titulo, 
          descricao, 
          categoria_id, 
          data_vencimento, 
          hora_vencimento, 
          pontos_xp, 
          recorrente, 
          padrao_recorrencia, 
          prioridade,
          created_at,
          updated_at
        ) 
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      
      const { data: tarefa, error } = await supabase.rpc('execute_sql_query', {
        sql_query: insertQuery,
        params: [
          userId,
          titulo,
          descricao || null,
          categoria_id || null,
          data_vencimento,
          hora_vencimento || null,
          pontos_xp || 20,
          recorrente || false,
          padrao_recorrencia || null,
          prioridade || 'media',
          now,
          now
        ]
      });
      
      if (error) throw error;
      
      const tarefaId = tarefa[0].id;
      
      // Se houver tags, associar à tarefa
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          const insertTagQuery = `
            INSERT INTO orbita_tarefa_tags (tarefa_id, tag_id)
            VALUES ($1, $2)
          `;
          
          const { error: tagError } = await supabase.rpc('execute_sql_query', {
            sql_query: insertTagQuery,
            params: [tarefaId, tagId]
          });
          
          if (tagError) throw tagError;
        }
      }
      
      // Buscar a tarefa completa com suas relações
      const { data: tarefaCompleta } = await supabase
        .rpc('orbita_obter_tarefas', {
          usuario_uuid: userId,
          tarefa_id_filtro: tarefaId
        });
      
      // Commit da transação
      await supabase.rpc('commit_transaction', { client_id: client });
      
      return NextResponse.json(tarefaCompleta[0] || tarefa[0]);
    } catch (error) {
      // Rollback em caso de erro
      await supabase.rpc('rollback_transaction', { client_id: client });
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}
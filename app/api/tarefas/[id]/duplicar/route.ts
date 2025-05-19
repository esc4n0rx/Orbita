// app/api/tarefas/[id]/duplicar/route.ts (continuação)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

// POST /api/tarefas/[id]/duplicar - Duplicar uma tarefa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    const { data_vencimento } = await request.json();
    
    // Buscar a tarefa a ser duplicada
    const { data: tarefaOriginal, error: erroConsulta } = await supabase
      .from('orbita_tarefas')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();
    
    if (erroConsulta) throw erroConsulta;
    
    if (!tarefaOriginal) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    
    // Criar nova tarefa com base na original
    const novaTarefa = {
      usuario_id: userId,
      titulo: tarefaOriginal.titulo,
      descricao: tarefaOriginal.descricao,
      categoria_id: tarefaOriginal.categoria_id,
      data_vencimento: data_vencimento || tarefaOriginal.data_vencimento,
      hora_vencimento: tarefaOriginal.hora_vencimento,
      concluida: false,
      pontos_xp: tarefaOriginal.pontos_xp,
      recorrente: tarefaOriginal.recorrente,
      padrao_recorrencia: tarefaOriginal.padrao_recorrencia,
      prioridade: tarefaOriginal.prioridade
    };
    
    // Inserir nova tarefa
    const { data: novaTarefaCriada, error } = await supabase
      .from('orbita_tarefas')
      .insert([novaTarefa])
      .select()
      .single();
    
    if (error) throw error;
    
    // Duplicar também as tags associadas
    const { data: tagsDaTarefa, error: erroTags } = await supabase
      .from('orbita_tarefa_tags')
      .select('tag_id')
      .eq('tarefa_id', id);
    
    if (erroTags) throw erroTags;
    
    if (tagsDaTarefa && tagsDaTarefa.length > 0) {
      const novasTags = tagsDaTarefa.map((tag) => ({
        tarefa_id: novaTarefaCriada.id,
        tag_id: tag.tag_id
      }));
      
      await supabase
        .from('orbita_tarefa_tags')
        .insert(novasTags);
    }
    
    return NextResponse.json(novaTarefaCriada);
  } catch (error) {
    console.error('Erro ao duplicar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao duplicar tarefa' },
      { status: 500 }
    );
  }
}
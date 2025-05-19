// app/api/tarefas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

// GET /api/tarefas/[id] - Buscar detalhes de uma tarefa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    
    const { data, error } = await supabase
      .from('orbita_tarefas')
      .select(`
        *,
        categoria:categoria_id(id, nome, cor),
        tags:orbita_tarefa_tags(tag_id(id, nome))
      `)
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar detalhes da tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes da tarefa' },
      { status: 500 }
    );
  }
}

// PUT /api/tarefas/[id] - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    const { 
      titulo, 
      descricao, 
      categoria_id,
      data_vencimento,
      hora_vencimento,
      concluida,
      pontos_xp,
      recorrente,
      padrao_recorrencia,
      prioridade,
      tags
    } = await request.json();
    
    // Atualizar tarefa
    const { data: tarefa, error } = await supabase
      .from('orbita_tarefas')
      .update({ 
        titulo,
        descricao,
        categoria_id,
        data_vencimento,
        hora_vencimento,
        concluida,
        pontos_xp,
        recorrente,
        padrao_recorrencia,
        prioridade,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!tarefa) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    
    // Se houver tags, atualizar associações
    if (tags) {
      // Remover todas as tags anteriores
      await supabase
        .from('orbita_tarefa_tags')
        .delete()
        .eq('tarefa_id', id);
      
      // Adicionar novas tags
      if (tags.length > 0) {
        const tarefaTags = tags.map((tagId: string) => ({
          tarefa_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('orbita_tarefa_tags')
          .insert(tarefaTags);
        
        if (tagError) throw tagError;
      }
    }
    
    return NextResponse.json(tarefa);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

// DELETE /api/tarefas/[id] - Remover tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    
    const { error } = await supabase
      .from('orbita_tarefas')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Tarefa removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao remover tarefa' },
      { status: 500 }
    );
  }
}
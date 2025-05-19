// app/api/tarefas/[id]/adiar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

// PATCH /api/tarefas/[id]/adiar - Adiar tarefa para outro dia
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    const { nova_data } = await request.json();
    
    if (!nova_data) {
      return NextResponse.json(
        { error: 'Nova data é obrigatória' },
        { status: 400 }
      );
    }
    
    // Buscar a tarefa atual
    const { data: tarefaExistente, error: erroConsulta } = await supabase
      .from('orbita_tarefas')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();
    
    if (erroConsulta) throw erroConsulta;
    
    if (!tarefaExistente) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    
    // Atualizar a data de vencimento e marcar como adiada
    const { data: tarefa, error } = await supabase
      .from('orbita_tarefas')
      .update({ 
        data_vencimento: nova_data,
        adiada_de: tarefaExistente.adiada_de || tarefaExistente.data_vencimento,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(tarefa);
  } catch (error) {
    console.error('Erro ao adiar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao adiar tarefa' },
      { status: 500 }
    );
  }
}
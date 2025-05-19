// app/api/tarefas/[id]/concluir/route.ts (modificação)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

// PATCH /api/tarefas/[id]/concluir - Marcar tarefa como concluída
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
    
    // Buscar a tarefa para verificar se já está concluída
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
    
    // Marcar como concluída
    const { data: tarefa, error } = await supabase
      .from('orbita_tarefas')
      .update({ 
        concluida: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Atualizar pontuação do usuário se for a primeira vez que conclui
    if (!tarefaExistente.concluida) {
      const { error: erroUsuario } = await supabase
        .from('orbita_usuarios')
        .update({ 
          pontos_xp: supabase.rpc('incrementar_pontos', { 
            usuario_uuid: userId,
            incremento: tarefa.pontos_xp 
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (erroUsuario) throw erroUsuario;
      
      // Verificar/atualizar a sequência de dias
      try {
        await fetch('/api/sequencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (seqError) {
        console.error('Erro ao atualizar sequência:', seqError);
        // Não interromper o fluxo se houver erro na sequência
      }
      
      // Se for uma tarefa recorrente, criar a próxima ocorrência
      if (tarefa.recorrente) {
        await criarProximaOcorrencia(tarefa);
      }
    }
    
    return NextResponse.json(tarefa);
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao concluir tarefa' },
      { status: 500 }
    );
  }
}

// Função para criar próxima ocorrência de tarefa recorrente
async function criarProximaOcorrencia(tarefa: any) {
  try {
    const dataAtual = new Date(tarefa.data_vencimento);
    let proximaData = new Date(dataAtual);
    
    // Calcular próxima data com base no padrão de recorrência
    switch (tarefa.padrao_recorrencia) {
      case 'daily':
        proximaData.setDate(dataAtual.getDate() + 1);
        break;
      case 'weekly':
        proximaData.setDate(dataAtual.getDate() + 7);
        break;
      case 'biweekly':
        proximaData.setDate(dataAtual.getDate() + 14);
        break;
      case 'monthly':
        proximaData.setMonth(dataAtual.getMonth() + 1);
        break;
      default:
        proximaData.setDate(dataAtual.getDate() + 1);
    }
    
    // Criar próxima ocorrência da tarefa
    await supabase
      .from('orbita_tarefas')
      .insert([{
        usuario_id: tarefa.usuario_id,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        categoria_id: tarefa.categoria_id,
        data_vencimento: proximaData.toISOString().split('T')[0],
        hora_vencimento: tarefa.hora_vencimento,
        concluida: false,
        pontos_xp: tarefa.pontos_xp,
        recorrente: true,
        padrao_recorrencia: tarefa.padrao_recorrencia,
        prioridade: tarefa.prioridade
      }]);
      
  } catch (error) {
    console.error('Erro ao criar próxima ocorrência:', error);
  }
}
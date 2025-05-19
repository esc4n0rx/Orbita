// app/api/tarefas/[id]/concluir/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

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
    
    // Iniciar uma transação
    const { data: client } = await supabase.rpc('begin_transaction');
    
    try {
      // Buscar a tarefa para verificar se já está concluída
      const getTarefaQuery = `
        SELECT * FROM orbita_tarefas
        WHERE id = $1 AND usuario_id = $2
      `;
      
      const { data: tarefaResult, error: tarefaError } = await supabase.rpc('execute_sql_query', {
        sql_query: getTarefaQuery,
        params: [id, userId]
      });
      
      if (tarefaError) throw tarefaError;
      
      if (!tarefaResult || tarefaResult.length === 0) {
        return NextResponse.json(
          { error: 'Tarefa não encontrada' },
          { status: 404 }
        );
      }
      
      const tarefaExistente = tarefaResult[0];
      
      // Marcar como concluída
      const updateTarefaQuery = `
        UPDATE orbita_tarefas
        SET concluida = true, updated_at = $1
        WHERE id = $2 AND usuario_id = $3
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      
      const { data: tarefaAtualizada, error: updateError } = await supabase.rpc('execute_sql_query', {
        sql_query: updateTarefaQuery,
        params: [now, id, userId]
      });
      
      if (updateError) throw updateError;
      
      // Atualizar pontuação do usuário se for a primeira vez que conclui
      if (!tarefaExistente.concluida) {
        const pontos = tarefaExistente.pontos_xp || 20;
        
        const updateUsuarioQuery = `
          UPDATE orbita_usuarios
          SET 
            pontos_xp = pontos_xp + $1,
            updated_at = $2
          WHERE id = $3
          RETURNING pontos_xp, nivel, proximo_nivel_xp
        `;
        
        const { data: usuarioResult, error: usuarioError } = await supabase.rpc('execute_sql_query', {
          sql_query: updateUsuarioQuery,
          params: [pontos, now, userId]
        });
        
        if (usuarioError) throw usuarioError;
        
        // Verificar e atualizar nível do usuário
        if (usuarioResult && usuarioResult.length > 0) {
          const { pontos_xp, nivel, proximo_nivel_xp } = usuarioResult[0];
          
          if (pontos_xp >= proximo_nivel_xp) {
            // Calcular novo nível e próximo nível XP
            const novoNivel = nivel + 1;
            let novoProximoNivelXP = 0;
            
            // Escala de pontos para próximo nível
            if (novoNivel === 2) novoProximoNivelXP = 250;
            else if (novoNivel === 3) novoProximoNivelXP = 500;
            else if (novoNivel === 4) novoProximoNivelXP = 1000;
            else if (novoNivel === 5) novoProximoNivelXP = 2000;
            else if (novoNivel === 6) novoProximoNivelXP = 4000;
            else if (novoNivel === 7) novoProximoNivelXP = 7000;
            else if (novoNivel === 8) novoProximoNivelXP = 10000;
            else if (novoNivel === 9) novoProximoNivelXP = 15000;
            else novoProximoNivelXP = 15000 + (novoNivel - 9) * 5000;
            
            // Atualizar nível
            const updateNivelQuery = `
              UPDATE orbita_usuarios
              SET 
                nivel = $1,
                proximo_nivel_xp = $2
              WHERE id = $3
            `;
            
            await supabase.rpc('execute_sql_query', {
              sql_query: updateNivelQuery,
              params: [novoNivel, novoProximoNivelXP, userId]
            });
          }
        }
        
        // Verificar/atualizar a sequência de dias
        const atualizarSequenciaQuery = `
          SELECT orbita_atualizar_sequencia($1, $2) as resultado
        `;
        
        await supabase.rpc('execute_sql_query', {
          sql_query: atualizarSequenciaQuery,
          params: [userId, now]
        });
        
        // Se for uma tarefa recorrente, criar a próxima ocorrência
        if (tarefaExistente.recorrente) {
          await criarProximaOcorrencia(tarefaExistente, client);
        }
      }
      
      // Commit da transação
      await supabase.rpc('commit_transaction', { client_id: client });
      
      return NextResponse.json(tarefaAtualizada[0]);
    } catch (error) {
      // Rollback em caso de erro
      await supabase.rpc('rollback_transaction', { client_id: client });
      throw error;
    }
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao concluir tarefa' },
      { status: 500 }
    );
  }
}

// Função auxiliar para criar próxima ocorrência de tarefa recorrente
async function criarProximaOcorrencia(tarefa: any, clientId: string) {
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
    
    // Converter para formato ISO (apenas a data)
    const proximaDataISO = proximaData.toISOString().split('T')[0];
    
    // Criar próxima ocorrência da tarefa
    const criarTarefaQuery = `
      INSERT INTO orbita_tarefas (
        usuario_id, 
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
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `;
    
    const now = new Date().toISOString();
    
    await supabase.rpc('execute_sql_query', {
      sql_query: criarTarefaQuery,
      params: [
        tarefa.usuario_id,
        tarefa.titulo,
        tarefa.descricao,
        tarefa.categoria_id,
        proximaDataISO,
        tarefa.hora_vencimento,
        false,
        tarefa.pontos_xp,
        true,
        tarefa.padrao_recorrencia,
        tarefa.prioridade,
        now,
        now
      ]
    });
  } catch (error) {
    console.error('Erro ao criar próxima ocorrência:', error);
    throw error;
  }
}
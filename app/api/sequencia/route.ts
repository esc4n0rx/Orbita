// app/api/sequencia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

// POST /api/sequencia - Verificar e atualizar sequência de dias
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter a data atual (São Paulo)
    const dataAtual = new Date();
    const fuso = 'America/Sao_Paulo';
    const dataAtualSP = new Date(
      dataAtual.toLocaleString('en-US', { timeZone: fuso })
    );
    const dataHoje = dataAtualSP.toISOString().split('T')[0];
    
    // Verificar se o usuário concluiu alguma tarefa hoje
    const { data: tarefasHoje, error: erroTarefas } = await supabase
      .from('orbita_tarefas')
      .select('id')
      .eq('usuario_id', userId)
      .eq('data_vencimento', dataHoje)
      .eq('concluida', true)
      .limit(1);
    
    if (erroTarefas) throw erroTarefas;
    
    // Se não concluiu nenhuma tarefa hoje, retornar sem atualizar
    if (!tarefasHoje || tarefasHoje.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhuma tarefa concluída hoje',
        sequencia_mantida: false 
      });
    }
    
    // Buscar dados do usuário
    const { data: dadosUsuario, error: erroUsuario } = await supabase
      .from('orbita_usuarios')
      .select('sequencia_dias, ultima_interacao')
      .eq('id', userId)
      .single();
    
    if (erroUsuario) throw erroUsuario;
    
    let novaSequencia = 1; // Valor padrão se não houver sequência
    let sequenciaMantida = false;
    
    if (dadosUsuario) {
      const ultimaInteracao = dadosUsuario.ultima_interacao
        ? new Date(dadosUsuario.ultima_interacao)
        : null;
      
      if (ultimaInteracao) {
        // Verificar se a última interação foi ontem
        const ontem = new Date(dataAtualSP);
        ontem.setDate(ontem.getDate() - 1);
        const dataOntem = ontem.toISOString().split('T')[0];
        
        const ultimaInteracaoData = ultimaInteracao.toISOString().split('T')[0];
        
        if (ultimaInteracaoData === dataOntem) {
          // Sequência continua
          novaSequencia = dadosUsuario.sequencia_dias + 1;
          sequenciaMantida = true;
        } else if (ultimaInteracaoData === dataHoje) {
          // Já interagiu hoje, manter a sequência atual
          novaSequencia = dadosUsuario.sequencia_dias;
          sequenciaMantida = true;
        }
        // Se não for ontem nem hoje, sequência é reiniciada (já definido como 1)
      }
    }
    
    // Atualizar dados do usuário
    const { data: atualizacaoUsuario, error: erroAtualizacao } = await supabase
      .from('orbita_usuarios')
      .update({
        sequencia_dias: novaSequencia,
        ultima_interacao: dataAtualSP.toISOString()
      })
      .eq('id', userId)
      .select('sequencia_dias')
      .single();
    
    if (erroAtualizacao) throw erroAtualizacao;
    
    // app/api/sequencia/route.ts (continuação)
    return NextResponse.json({
      message: sequenciaMantida 
        ? 'Sequência mantida/aumentada' 
        : 'Sequência reiniciada',
      sequencia_dias: atualizacaoUsuario.sequencia_dias,
      sequencia_mantida: sequenciaMantida
    });
  } catch (error) {
    console.error('Erro ao atualizar sequência:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar sequência' },
      { status: 500 }
    );
  }
}
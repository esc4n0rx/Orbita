// app/api/tarefas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

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
    
    let query = supabase
      .from('orbita_tarefas')
      .select(`
        *,
        categoria:categoria_id(id, nome, cor),
        tags:orbita_tarefa_tags(tag_id(id, nome))
      `)
      .eq('usuario_id', userId)
      .order('hora_vencimento', { nullsFirst: false })
      .order('created_at');
    
    // Aplicar filtros
    if (data) {
      query = query.eq('data_vencimento', data);
    }
    
    if (status === 'pendente') {
      query = query.eq('concluida', false);
    } else if (status === 'concluida') {
      query = query.eq('concluida', true);
    } else if (status === 'recorrente') {
      query = query.eq('recorrente', true);
    }
    
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    
    // Aplicar filtro por tag (usando um JOIN implícito)
    if (tagId) {
      // Esta é uma abordagem especial para filtrar por tags
      query = query.filter('tags.tag_id.id', 'eq', tagId);
    }
    
    const { data: tarefas, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(tarefas);
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
    
    // Inserir tarefa
    const { data: tarefa, error } = await supabase
      .from('orbita_tarefas')
      .insert([
        { 
          usuario_id: userId,
          titulo,
          descricao,
          categoria_id,
          data_vencimento,
          hora_vencimento,
          pontos_xp: pontos_xp || 20,
          recorrente: recorrente || false,
          padrao_recorrencia,
          prioridade: prioridade || 'media'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Se houver tags, associar à tarefa
    if (tags && tags.length > 0) {
      const tarefaTags = tags.map((tagId: string) => ({
        tarefa_id: tarefa.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('orbita_tarefa_tags')
        .insert(tarefaTags);
      
      if (tagError) throw tagError;
    }
    
    return NextResponse.json(tarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}
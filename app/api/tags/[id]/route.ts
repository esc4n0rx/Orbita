// app/api/tags/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

// PUT /api/tags/[id] - Atualizar tag
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
    const { nome } = await request.json();
    
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('orbita_tags')
      .update({ nome })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Remover tag
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
    
    // Remover associações primeiro
    await supabase
      .from('orbita_tarefa_tags')
      .delete()
      .eq('tag_id', id);
    
    // Remover a tag
    const { error } = await supabase
      .from('orbita_tags')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Tag removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover tag:', error);
    return NextResponse.json(
      { error: 'Erro ao remover tag' },
      { status: 500 }
    );
  }
}
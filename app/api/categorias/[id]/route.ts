// app/api/categorias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers'

// PUT /api/categorias/[id] - Atualizar categoria
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
    const { nome, cor } = await request.json();
    
    if (!nome || !cor) {
      return NextResponse.json(
        { error: 'Nome e cor são obrigatórios' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('orbita_categorias')
      .update({ 
        nome,
        cor,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// DELETE /api/categorias/[id] - Remover categoria
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
      .from('orbita_categorias')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao remover categoria' },
      { status: 500 }
    );
  }
}
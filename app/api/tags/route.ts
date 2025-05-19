// app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      console.log('Usuário não autenticado na rota /api/tags');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('Buscando tags para o usuário:', userId);
    
    const { data, error } = await supabase
      .from('orbita_tags')
      .select('*')
      .eq('usuario_id', userId)
      .order('nome');
    
    if (error) {
      console.error('Erro do Supabase ao buscar tags:', error);
      throw error;
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Criar nova tag
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { nome } = await request.json();
    
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('orbita_tags')
      .insert([
        { 
          usuario_id: userId,
          nome
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tag' },
      { status: 500 }
    );
  }
}
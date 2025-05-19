// app/api/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const query = `
      SELECT id, nome, cor
      FROM orbita_categorias
      WHERE usuario_id = $1
      ORDER BY nome
    `;
    
    const { data, error } = await supabase.rpc('execute_sql_query', {
      sql_query: query,
      params: [userId]
    });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST /api/categorias - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { nome, cor } = await request.json();
    
    if (!nome || !cor) {
      return NextResponse.json(
        { error: 'Nome e cor são obrigatórios' },
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO orbita_categorias (usuario_id, nome, cor, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, cor
    `;
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase.rpc('execute_sql_query', {
      sql_query: query,
      params: [userId, nome, cor, now, now]
    });
    
    if (error) throw error;
    
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
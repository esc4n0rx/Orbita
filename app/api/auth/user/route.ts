import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Buscar detalhes adicionais do perfil do usuário
    const { data: perfil } = await supabase
      .from('orbita_usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ user, perfil });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
// app/api/auth/oauth-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    const supabase = createServerSupabaseClient();
    
    // Processar a sessão com o código
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data.user) {
      console.error('Erro na autenticação OAuth:', error);
      return NextResponse.redirect(new URL('/?error=auth', request.url));
    }
    
    // Verificar se o perfil já existe
    const { data: profileData, error: profileError } = await supabase
      .from('orbita_usuarios')
      .select('id')
      .eq('id', data.user.id)
      .single();
    
    // Se não existir, criar perfil
    if (!profileData && !profileError) {
      // Extrair dados do perfil do Google
      const { email, user_metadata } = data.user;
      const nome = user_metadata?.name || email?.split('@')[0] || 'Usuário';
      
      // Criar perfil
      await supabase.from('orbita_usuarios').insert({
        id: data.user.id,
        nome,
        email,
        avatar_url: user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // Redirecionar para o dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Erro durante callback OAuth:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
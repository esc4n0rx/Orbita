import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Criar cliente Supabase para verificar a sessão
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
      },
    }
  );

  // Lista de rotas que não precisam de autenticação
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth')
  );

  // Se for uma rota pública, permitir o acesso sem verificar autenticação
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Verificar se temos um cookie de sessão
    const { data: { session } } = await supabase.auth.getSession();

    // Redirecionar para a página inicial se não estiver autenticado
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    // Em caso de erro, redirecionar para a página inicial
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continuar com a requisição se tudo estiver ok
  return NextResponse.next();
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
    '/profile/:path*',
  ],
};
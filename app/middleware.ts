// app/middleware.ts (atualizado)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth as firebaseAuth } from '@/lib/firebase-admin'; // Precisamos criar esta biblioteca também

export async function middleware(request: NextRequest) {
  // Lista de rotas que não precisam de autenticação
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth')
  );

  // Se for uma rota pública, permitir o acesso sem verificar autenticação
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Verificar qual o provedor está sendo usado (Firebase ou Supabase)
    const authProvider = request.cookies.get('auth_provider')?.value || 'firebase';
    
    if (authProvider === 'supabase') {
      // Criar cliente Supabase para verificar a sessão
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
          auth: {
            persistSession: false,
          },
        }
      );
      
      // Verificar se temos um cookie de sessão no Supabase
      const { data: { session } } = await supabase.auth.getSession();

      // Redirecionar para a página inicial se não estiver autenticado
      if (!session) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else {
      // Verificar token do Firebase
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      const token = authHeader.split('Bearer ')[1];
      try {
        // Verificar token com Firebase Admin
        await firebaseAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.redirect(new URL('/', request.url));
      }
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
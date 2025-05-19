// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Permitir solicitações públicas
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);
  
  // Verificar cookie do usuário
  const userId = request.cookies.get('orbita_user_id')?.value;
  
  // Se for uma rota protegida e não tivermos um ID de usuário, redirecionar para login
  if (!isPublicRoute && !userId && !request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Para rotas de API, injetar o ID do usuário nos headers
  if (request.nextUrl.pathname.startsWith('/api/') && userId) {
    const response = NextResponse.next();
    response.headers.set('x-user-id', userId);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
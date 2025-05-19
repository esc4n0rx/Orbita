import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth as firebaseAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    const authProvider = request.cookies.get('auth_provider')?.value || 'firebase';
    
    if (authProvider === 'supabase') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
          auth: {
            persistSession: false,
          },
        }
      );
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else {

      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      const token = authHeader.split('Bearer ')[1];
      try {

        await firebaseAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (error) {

    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
    '/profile/:path*',
  ],
};
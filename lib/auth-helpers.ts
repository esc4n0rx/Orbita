// lib/auth-helpers.ts
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // Tentar primeiro pelo Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      return session.user.id;
    }
    
    // Se não encontrar no Supabase, tentar pelo Firebase
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
      } catch (error) {
        console.error('Erro ao verificar token Firebase:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
}
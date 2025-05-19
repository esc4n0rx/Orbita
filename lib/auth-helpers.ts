// lib/auth-helpers.ts
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // Verificar no header de autorização
    const authHeader = request.headers.get('authorization');
    console.log('authHeader', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Método simples: verificar diretamente com o Supabase
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        // Tentar com Firebase se Supabase falhar
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          return decodedToken.uid;
        } catch (fbError) {
          console.error('Erro ao verificar token Firebase:', fbError);
          return null;
        }
      }
      
      return data.user.id;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
}
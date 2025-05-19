// lib/auth-helpers.ts (versão simplificada)
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // Verificar no header de autorização (que virá do TokenService)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Tentar validar token com Firebase primeiro
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return decodedToken.uid;
    } catch (fbError) {
      // Se falhar, tentar com Supabase
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
          return null;
        }
        return data.user.id;
      } catch (supError) {
        console.error('Erro ao validar token Supabase:', supError);
        return null;
      }
    }
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
}
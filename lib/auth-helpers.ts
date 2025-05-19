// lib/auth-helpers.ts
import { NextRequest } from 'next/server';
import { UserStorage } from '@/lib/token-service';

export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // Verificar no header de autorização
    const userId = request.headers.get('x-user-id');
    
    if (userId) {
      return userId;
    }
    
    // Alternativa: buscar das cookies para APIs do servidor
    const userIdCookie = request.cookies.get('orbita_user_id')?.value;
    
    return userIdCookie || null;
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
}
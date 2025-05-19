// lib/api.ts
import { UserStorage } from './token-service';

export async function fetchAPI(url: string, options: RequestInit = {}) {
  try {
    const userId = UserStorage.getUserId();
    
    if (!userId) {
      console.warn(`Tentando acessar ${url} sem ID de usuário`);
      throw new Error('Usuário não autenticado');
    }
    
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
      'Content-Type': 'application/json',
      'x-user-id': userId
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error(`Erro de autenticação (${response.status}) ao acessar ${url}`);
        // Limpar dados do usuário em caso de erro de autenticação
        UserStorage.clearUser();
      }
      
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      throw new Error(`Erro API (${response.status}): ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Erro ao chamar API ${url}:`, error);
    throw error;
  }
}
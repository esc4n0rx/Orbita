// hooks/use-api.ts
import { UserStorage } from '@/lib/token-service';

export function useApi() {
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      // Obter o ID do usuário
      const userId = UserStorage.getUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const headers: HeadersInit = {
        ...options.headers as Record<string, string>,
        'Content-Type': 'application/json',
        'x-user-id': userId
      };
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Erro de autenticação na API:', url);
          UserStorage.clearUser();
        }
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao chamar API ${url}:`, error);
      throw error;
    }
  };
  
  return { fetchWithAuth };
}
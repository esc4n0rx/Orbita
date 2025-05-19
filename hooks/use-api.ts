// hooks/use-api.ts (versão corrigida)
import { useAuth } from "@/contexts/auth-context";
import { TokenService } from "@/lib/token-service";

export function useApi() {
  const { user } = useAuth();
  
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      // Obter o token diretamente do TokenService
      const token = TokenService.getToken();
      
      const headers: HeadersInit = {
        ...options.headers as Record<string, string>,
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Erro de autenticação na API:', url);
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
// lib/api.ts
import { TokenService } from './token-service';

export async function fetchAPI(url: string, options: RequestInit = {}) {
  try {
    const token = TokenService.getToken();
    
    if (!token) {
      console.warn(`Tentando acessar ${url} sem token`);
      // Opcionalmente, redirecionar para página de login ou mostrar erro
    }
    
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`Enviando requisição para ${url} com token`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      // Verificar se é erro de autenticação
      if (response.status === 401 || response.status === 403) {
        console.error(`Erro de autenticação (${response.status}) ao acessar ${url}`);
        // Aqui você poderia implementar um redirecionamento para a página de login
        // ou exibir uma mensagem para o usuário fazer login novamente
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
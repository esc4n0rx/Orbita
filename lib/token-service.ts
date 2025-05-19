// lib/token-service.ts
const TOKEN_KEY = 'orbita_auth_token';
const PROVIDER_KEY = 'orbita_auth_provider';

export const TokenService = {
  // Salvar token
  setToken: (token: string): void => {
    if (!token) {
      console.error('Tentativa de salvar token vazio ou nulo!');
      return;
    }
    
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('Token salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  },


  // Obter token
  getToken: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Remover token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Salvar provedor (supabase/firebase)
  setProvider: (provider: string): void => {
    localStorage.setItem(PROVIDER_KEY, provider);
  },

  // Obter provedor
  getProvider: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PROVIDER_KEY) || 'supabase';
  },

  // Remover provedor
  removeProvider: (): void => {
    localStorage.removeItem(PROVIDER_KEY);
  },

  // Limpar tudo
 clearAuth: (): void => {
    try {
      TokenService.removeToken();
      TokenService.removeProvider();
      console.log('Autenticação limpa com sucesso');
      
      // Verificação
      const tokenRestante = localStorage.getItem(TOKEN_KEY);
      if (tokenRestante) {
        console.warn('ATENÇÃO: Token não foi removido corretamente!');
      }
    } catch (error) {
      console.error('Erro ao limpar autenticação:', error);
    }
  }
};
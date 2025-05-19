// lib/token-service.ts
const TOKEN_KEY = 'orbita_auth_token';
const PROVIDER_KEY = 'orbita_auth_provider';

export const TokenService = {
  // Salvar token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Obter token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
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
    TokenService.removeToken();
    TokenService.removeProvider();
  }
};
// lib/token-service.ts
const USER_ID_KEY = 'orbita_user_id';

export const UserStorage = {
  // Salvar ID do usuário
  setUserId: (userId: string): void => {
    if (!userId) {
      console.error('Tentativa de salvar ID de usuário vazio ou nulo!');
      return;
    }
    
    try {
      localStorage.setItem(USER_ID_KEY, userId);
      console.log('ID do usuário salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar ID do usuário:', error);
    }
  },

  // Obter ID do usuário
  getUserId: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return localStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
      return null;
    }
  },

  // Limpar dados do usuário (logout)
  clearUser: (): void => {
    try {
      localStorage.removeItem(USER_ID_KEY);
      console.log('Dados do usuário limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados do usuário:', error);
    }
  },
  
  // Verificar se o usuário está logado
  isLoggedIn: (): boolean => {
    return !!UserStorage.getUserId();
  }
};
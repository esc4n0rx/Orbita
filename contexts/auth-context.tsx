// contexts/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserStorage } from '@/lib/token-service';

type UserDetails = {
  id: string;
  nome: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: UserDetails | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean, error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);

  // Carregar usuário do armazenamento local
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const userId = UserStorage.getUserId();
        if (!userId) {
          setLoading(false);
          return;
        }
        
        // Carregar dados do usuário
        await refreshUserData(userId);
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        UserStorage.clearUser();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Função para atualizar dados do usuário
  const refreshUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orbita_usuarios')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.error('Erro ao buscar dados do usuário:', error);
        UserStorage.clearUser();
        setUser(null);
        return;
      }
      
      setUser(data as UserDetails);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      UserStorage.clearUser();
      setUser(null);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Autenticar com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!data.user || !data.user.id) {
        return { success: false, error: 'Falha ao obter dados do usuário' };
      }
      
      // Salvar ID do usuário no localStorage
      UserStorage.setUserId(data.user.id);
      
      // Carregar dados do usuário
      await refreshUserData(data.user.id);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Registrar com Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!data.user || !data.user.id) {
        return { success: false, error: 'Falha ao obter dados do usuário' };
      }
      
      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('orbita_usuarios')
        .insert({
          id: data.user.id,
          nome: name,
          email: data.user.email,
          bio: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pontos_xp: 0,
          nivel: 1,
          proximo_nivel_xp: 100,
          sequencia_dias: 0
        });
        
      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        return { success: false, error: 'Erro ao criar perfil do usuário' };
      }
      
      // Salvar ID do usuário no localStorage
      UserStorage.setUserId(data.user.id);
      
      // Carregar dados do usuário
      await refreshUserData(data.user.id);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Apenas para manter compatibilidade com Supabase
      await supabase.auth.signOut();
      
      // Limpar dados do usuário
      UserStorage.clearUser();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      
      const userId = UserStorage.getUserId();
      if (!userId) {
        setUser(null);
        return;
      }
      
      await refreshUserData(userId);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
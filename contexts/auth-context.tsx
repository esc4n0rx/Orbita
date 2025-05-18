"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Inicializar o estado de autenticação e escutar mudanças
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Verificar a sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Buscar detalhes do perfil
          const { data, error } = await supabase
            .from('orbita_usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data && !error) {
            setUserDetails(data as UserDetails);
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Configurar o listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Buscar detalhes do perfil quando houver mudança na autenticação
          const { data } = await supabase
            .from('orbita_usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUserDetails(data as UserDetails);
        } else {
          setUserDetails(null);
        }
      }
    );
    
    // Limpar listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUser(null);
        setUserDetails(null);
        return;
      }
      
      setUser(user);
      
      // Buscar detalhes atualizados do perfil
      const { data } = await supabase
        .from('orbita_usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserDetails(data as UserDetails);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    userDetails,
    loading,
    refreshUser,
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
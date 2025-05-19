// contexts/auth-context.tsx (versão atualizada)
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { auth, db, googleProvider } from '@/lib/firebase';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { TokenService } from '@/lib/token-service';

type AuthProvider = 'supabase' | 'firebase';

type UserDetails = {
  id: string;
  nome: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  provider?: AuthProvider;
};

type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | FirebaseUser | null;
  userDetails: UserDetails | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<{ data: any | null, error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ data: any | null, error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ data: any | null, error: Error | null }>;
  signOut: () => Promise<void>;
  activeProvider: AuthProvider;
  switchProvider: (provider: AuthProvider) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeProvider, setActiveProvider] = useState<AuthProvider>(
    (TokenService.getProvider() as AuthProvider) || 'supabase'
  );

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Timeout de segurança acionado para estado de loading");
        setLoading(false);
      }
    }, 5000); 

    return () => clearTimeout(safetyTimeout);
  }, [loading]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Verificar se temos um token salvo
        const savedToken = TokenService.getToken();
        const savedProvider = TokenService.getProvider() as AuthProvider;
        
        if (!savedToken) {
          setLoading(false);
          return;
        }
        
        if (savedProvider === 'supabase') {
          // Usar token salvo para reestabelecer sessão
          const { data, error } = await supabase.auth.getUser(savedToken);
          
          if (error || !data.user) {
            // Token inválido
            TokenService.clearAuth();
            setLoading(false);
            return;
          }
          
          setUser(data.user);
          
          // Buscar detalhes do usuário
          const { data: userData } = await supabase
            .from('orbita_usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userData) {
            setUserDetails({
              ...userData as UserDetails,
              provider: 'supabase'
            });
          }
          
          // Também atualizar a sessão para compatibilidade
          const { data: sessionData } = await supabase.auth.getSession();
          setSession(sessionData.session);
        } else {
          // Firebase - tentar restaurar a sessão
          // Nota: Firebase já mantém a sessão automaticamente via persistência
          const unsubFirebase = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
              // Atualizar token salvo para manter fresco
              const freshToken = await firebaseUser.getIdToken();
              TokenService.setToken(freshToken);
              
              // Buscar detalhes do usuário
              const userRef = doc(db, 'orbita_usuarios', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                setUserDetails({
                  ...userSnap.data() as UserDetails,
                  provider: 'firebase'
                });
              }
            } else {
              // Se onAuthStateChanged não retorna usuário, limpar tokens
              TokenService.clearAuth();
              setUserDetails(null);
            }
            
            setLoading(false);
            return () => unsubFirebase();
          });
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        TokenService.clearAuth();
        setLoading(false);
      }
    };
    
    initAuth();
  }, [activeProvider]);

  const signInWithGoogle = async () => {
    try {
      // Sempre usa Firebase para login com Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Salvar token
      const token = await user.getIdToken();
      TokenService.setToken(token);
      TokenService.setProvider('firebase');
      setActiveProvider('firebase');

      const userRef = doc(db, 'orbita_usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const userDetails: UserDetails = {
          id: user.uid,
          nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          bio: null,
          avatar_url: user.photoURL,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: 'firebase'
        };
        
        await setDoc(userRef, userDetails);
      }
      
      return { data: { user }, error: null };
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Sempre usar Supabase para login com email/senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Salvar token
      if (data.session?.access_token) {
        TokenService.setToken(data.session.access_token);
        TokenService.setProvider('supabase');
        setActiveProvider('supabase');
      }
      
      setUser(data.user);
      setSession(data.session);
      
      // Buscar detalhes do usuário
      if (data.user) {
        const { data: userData } = await supabase
          .from('orbita_usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userData) {
          setUserDetails({
            ...userData as UserDetails,
            provider: 'supabase'
          });
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao fazer login com email:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      // Sempre usar Supabase para registro com email/senha
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name,
          },
        },
      });
      
      if (error) throw error;
      
      // Salvar token
      if (data.session?.access_token) {
        TokenService.setToken(data.session.access_token);
        TokenService.setProvider('supabase');
        setActiveProvider('supabase');
      }
      
      setUser(data.user);
      setSession(data.session);
      
      // Verificar se o usuário foi criado
      if (data.user && data.user.id) {
        // Aguardar um momento para garantir que o usuário foi criado no Auth
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Tentar criar o perfil do usuário
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
              provider: 'supabase'
            });
            
          if (profileError) {
            console.error("Erro ao criar perfil de usuário:", profileError);
          } else {
            // Definir detalhes do usuário
            setUserDetails({
              id: data.user.id,
              nome: name,
              email: data.user.email || '',
              bio: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              provider: 'supabase'
            });
          }
        } catch (profileError) {
          console.error("Exceção ao criar perfil de usuário:", profileError);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signOut = async () => {
    try {
      if (activeProvider === 'supabase') {
        await supabase.auth.signOut();
      } else {
        await firebaseSignOut(auth);
      }
      
      // Limpar dados de autenticação
      TokenService.clearAuth();
      setUser(null);
      setUserDetails(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      
      if (activeProvider === 'supabase') {
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
        
        setUserDetails({
          ...data as UserDetails,
          provider: 'supabase'
        });
      } else {
        // Refresh do Firebase já é automático pelo listener
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Atualizar token armazenado
          const freshToken = await currentUser.getIdToken(true); // force refresh
          TokenService.setToken(freshToken);
          
          const userRef = doc(db, 'orbita_usuarios', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserDetails({
              ...userSnap.data() as UserDetails,
              provider: 'firebase'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = (provider: AuthProvider) => {
    // Fazer logout antes de trocar de provedor
    signOut().then(() => {
      setActiveProvider(provider);
      TokenService.setProvider(provider);
    });
  };

  const value = {
    session,
    user,
    userDetails,
    loading,
    refreshUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    activeProvider,
    switchProvider
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
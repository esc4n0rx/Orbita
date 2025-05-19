// contexts/auth-context.tsx
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
  const [activeProvider, setActiveProvider] = useState<AuthProvider>('supabase'); // Supabase como padrão fixo

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
        
        if (activeProvider === 'supabase') {
          // Inicializar autenticação do Supabase
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            const { data, error } = await supabase
              .from('orbita_usuarios')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (data && !error) {
              setUserDetails({
                ...data as UserDetails,
                provider: 'supabase'
              });
            }
          }
          
          // Configurar listener para mudanças na autenticação
          const { data: { subscription } } = await supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              setSession(newSession);
              setUser(newSession?.user || null);
              
              if (newSession?.user) {
                const { data } = await supabase
                  .from('orbita_usuarios')
                  .select('*')
                  .eq('id', newSession.user.id)
                  .single();
                
                if (data) {
                  setUserDetails({
                    ...data as UserDetails,
                    provider: 'supabase'
                  });
                }
              } else {
                setUserDetails(null);
              }
            }
          );
          
          setLoading(false);
          
          return () => {
            subscription.unsubscribe();
          };
        } else {
          const unsubFirebase = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
              const userRef = doc(db, 'orbita_usuarios', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                setUserDetails({
                  ...userSnap.data() as UserDetails,
                  provider: 'firebase'
                });
              }
            } else {
              setUserDetails(null);
            }
            
            setLoading(false);
          });
          
          return () => unsubFirebase();
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
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
      
      // Alterar o provedor ativo para Firebase após login com Google
      setActiveProvider('firebase');
      
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
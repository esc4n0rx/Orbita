// contexts/auth-context.tsx (atualizado)
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
  signInWithGoogle: (provider?: AuthProvider) => Promise<{ data: any | null, error: Error | null }>;
  signInWithEmail: (email: string, password: string, provider?: AuthProvider) => Promise<{ data: any | null, error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string, provider?: AuthProvider) => Promise<{ data: any | null, error: Error | null }>;
  signOut: (provider?: AuthProvider) => Promise<void>;
  activeProvider: AuthProvider;
  switchProvider: (provider: AuthProvider) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeProvider, setActiveProvider] = useState<AuthProvider>('firebase');

  // Inicializar o estado de autenticação e escutar mudanças
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        if (activeProvider === 'supabase') {
          // Verificar a sessão atual no Supabase
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
              setUserDetails({
                ...data as UserDetails,
                provider: 'supabase'
              });
            }
          }
        } else {
          // Verificar usuário Firebase
          const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
              // Buscar detalhes do perfil no Firestore
              const userRef = doc(db, 'orbita_usuarios', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                setUserDetails({
                  ...userSnap.data() as UserDetails,
                  provider: 'firebase'
                });
              } else {
                // Se não existir no Firestore, criar perfil básico
                const newUserDetails: UserDetails = {
                  id: firebaseUser.uid,
                  nome: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
                  email: firebaseUser.email || '',
                  bio: null,
                  avatar_url: firebaseUser.photoURL,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  provider: 'firebase'
                };
                
                await setDoc(userRef, newUserDetails);
                setUserDetails(newUserDetails);
              }
            } else {
              setUserDetails(null);
            }
            
            setLoading(false);
          });
          
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Configurar o listener para mudanças na autenticação do Supabase
    if (activeProvider === 'supabase') {
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
            
            setUserDetails({
              ...data as UserDetails,
              provider: 'supabase'
            });
          } else {
            setUserDetails(null);
          }
        }
      );
      
      // Limpar listener
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeProvider]);

  const signInWithGoogle = async (provider: AuthProvider = activeProvider) => {
    try {
      if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        return { data, error: null };
      } else {
        // Firebase Google login
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Verificar se o usuário já existe no Firestore
        const userRef = doc(db, 'orbita_usuarios', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // Criar perfil no Firestore
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
      }
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signInWithEmail = async (email: string, password: string, provider: AuthProvider = activeProvider) => {
    try {
      if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        return { data, error: null };
      } else {
        // Firebase email login
        const userCredential = await firebaseSignInWithEmail(auth, email, password);
        return { data: { user: userCredential.user }, error: null };
      }
    } catch (error) {
      console.error('Erro ao fazer login com email:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, provider: AuthProvider = activeProvider) => {
    try {
      if (provider === 'supabase') {
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
        return { data, error: null };
      } else {
        // Firebase email signup
        const userCredential = await firebaseCreateUser(auth, email, password);
        const user = userCredential.user;
        
        // Criar perfil no Firestore
        const userDetails: UserDetails = {
          id: user.uid,
          nome: name,
          email: user.email || '',
          bio: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: 'firebase'
        };
        
        await setDoc(doc(db, 'orbita_usuarios', user.uid), userDetails);
        
        return { data: { user }, error: null };
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signOut = async (provider: AuthProvider = activeProvider) => {
    try {
      if (provider === 'supabase') {
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
    signOut(activeProvider).then(() => {
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
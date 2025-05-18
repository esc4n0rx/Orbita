"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useRequireAuth = (redirectTo = '/') => {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(redirectTo);
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, redirectTo]);

  return { user, loading };
};
// app/auth/callback/page.tsx (atualizado)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { activeProvider } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Para o Firebase, não precisamos processar o callback diretamente
        // pois isso é feito pelo Firebase SDK via popup
        if (activeProvider === 'firebase') {
          router.push("/dashboard");
          return;
        }
        
        // Processa o callback OAuth do Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {
          // Redireciona para o dashboard após login bem-sucedido
          router.push("/dashboard");
        } else {
          // Se não houver sessão, redireciona para a página inicial
          router.push("/");
        }
      } catch (error) {
        console.error("Erro durante autenticação:", error);
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, activeProvider]);

  return <LoadingSpinner message="Autenticando..." />;
}
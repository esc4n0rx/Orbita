// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processa o callback OAuth
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
  }, [router]);

  return <LoadingSpinner message="Autenticando..." />;
}
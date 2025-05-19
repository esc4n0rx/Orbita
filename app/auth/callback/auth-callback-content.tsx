// app/auth/callback/auth-callback-content.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallbackContent() {
  const router = useRouter();
  const { activeProvider } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (activeProvider === 'firebase') {
          router.push("/dashboard");
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {

          router.push("/dashboard");
        } else {
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
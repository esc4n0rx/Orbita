// components/app-layout.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useRouter } from "next/navigation"
import { UserStorage } from "@/lib/token-service"
import { Loader2 } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  title?: string
}

export function AppLayout({ children, showHeader = true, title }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = () => {
      const isLoggedIn = UserStorage.isLoggedIn();
      
      if (!isLoggedIn) {
        console.log("Usuário não autenticado, redirecionando para login");
        router.push('/');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="text-md text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      {showHeader && (
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-bold">{title || "Orbita"}</h1>
            <UserNav />
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
      <MobileNav />
    </div>
  )
}
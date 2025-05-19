// app/auth-page.tsx (com modal de instalação)
"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Smartphone, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InstallPWAModal } from "@/components/install-pwa-modal"

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, activeProvider, switchProvider } = useAuth();
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    const checkIfPWAInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsPWAInstalled(isStandalone);
    };
    
    checkIfPWAInstalled();
    
    if (!loading && user) {
      console.log("Usuário já autenticado, redirecionando para dashboard");
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
          <p className="text-md text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Orbita</h1>
          <p className="text-sm text-slate-400">
            Sistema de rotina inteligente que te mantém na órbita dos seus objetivos
          </p>
        </div>

        {isPWAInstalled ? (
          <Card className="border-slate-800 bg-slate-900/50">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                  <CardDescription>Entre com sua conta para acessar o sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <div className="flex items-center space-x-2 mb-4">
                    <Label htmlFor="auth-provider">Usar Firebase</Label>
                    <Switch 
                      id="auth-provider" 
                      checked={activeProvider === 'firebase'}
                      onCheckedChange={(checked) => switchProvider(checked ? 'firebase' : 'supabase')}
                    />
                    <span className="text-xs text-slate-400">
                      {activeProvider === 'firebase' ? 'Firebase' : 'Supabase'}
                    </span>
                  </div> */}
                  <LoginForm />
                </CardContent>
              </TabsContent>
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle className="text-xl">Crie sua conta</CardTitle>
                  <CardDescription>Preencha os dados abaixo para se cadastrar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <div className="flex items-center space-x-2 mb-4">
                    <Label htmlFor="auth-provider-register">Usar Firebase</Label>
                    <Switch 
                      id="auth-provider-register" 
                      checked={activeProvider === 'firebase'}
                      onCheckedChange={(checked) => switchProvider(checked ? 'firebase' : 'supabase')}
                    />
                    <span className="text-xs text-slate-400">
                      {activeProvider === 'firebase' ? 'Firebase' : 'Supabase'}
                    </span>
                  </div> */}
                  <RegisterForm />
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-center">Instale o Orbita</CardTitle>
              <CardDescription className="text-center">
                Para utilizar o Orbita, é necessário instalá-lo como um aplicativo 
                em seu dispositivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Smartphone className="h-20 w-20 text-cyan-500" />
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-slate-400 text-center">
                Siga as instruções na tela para instalar o Orbita e aproveitar 
                ao máximo suas funcionalidades.
              </p>
            </CardFooter>
          </Card>
        )}

        <p className="px-8 text-center text-sm text-slate-400">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-white">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
      
      {!isPWAInstalled && <InstallPWAModal />}
    </div>
  )
}
// components/login-form.tsx (atualizado)
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context";
import { FcGoogle } from "react-icons/fc";

export function LoginForm() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, activeProvider } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle('firebase');
      if (error) throw error;
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const { data, error } = await signInWithEmail(formData.email, formData.password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          value={formData.email}
          onChange={handleChange}
          className="border-slate-800 bg-slate-950/50"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Button variant="link" className="h-auto p-0 text-xs text-cyan-400" asChild>
            <a href="/forgot-password">Esqueceu a senha?</a>
          </Button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange}
          className="border-slate-800 bg-slate-950/50"
          disabled={loading}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember-me" 
          checked={formData.rememberMe} 
          onCheckedChange={handleCheckboxChange}
          disabled={loading}
        />
        <Label htmlFor="remember-me" className="text-sm">
          Lembrar de mim
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
      <Button 
        variant="outline" 
        className="border-slate-800 bg-slate-950/50 hover:bg-slate-900"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>
    </form>
  )
}
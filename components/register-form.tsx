// components/register-form.tsx (atualizado)
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context";
import { FcGoogle } from "react-icons/fc";

export function RegisterForm() {
  const router = useRouter();
  const { signInWithGoogle, signUpWithEmail, activeProvider } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error("Erro ao registrar com Google:", error);
      toast({
        title: "Erro ao registrar com Google",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);
  
  try {
    const { data, error } = await signUpWithEmail(
      formData.email, 
      formData.password, 
      formData.name
    );
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Conta criada com sucesso!",
      description: "Redirecionando para o dashboard...",
    });
    
    router.push('/dashboard');
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    toast({
      title: "Erro ao criar conta",
      description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
} 
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Seu nome"
          required
          value={formData.name}
          onChange={handleChange}
          className={`border-slate-800 bg-slate-950/50 ${errors.name ? "border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          value={formData.email}
          onChange={handleChange}
          className={`border-slate-800 bg-slate-950/50 ${errors.email ? "border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange}
          className={`border-slate-800 bg-slate-950/50 ${errors.password ? "border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Senha</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`border-slate-800 bg-slate-950/50 ${errors.confirmPassword ? "border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar conta"
        )}
      </Button>

      <Button 
        variant="outline" 
        className="border-slate-800 bg-slate-950/50 hover:bg-slate-900"
        onClick={handleGoogleRegister}
        disabled={loading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>
    </form>
  )
}
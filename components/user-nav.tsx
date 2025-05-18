"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type UserDetails = {
  id: string;
  nome: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
};

export function UserNav() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserDetails(null);
          return;
        }
        
        // Buscar detalhes do perfil
        const { data } = await supabase
          .from('orbita_usuarios')
          .select('id, nome, email, bio, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserDetails(data as UserDetails);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Esperamos vê-lo novamente em breve.",
      });
      
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao sair. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Gerar as iniciais do nome do usuário
  const getInitials = () => {
    if (!userDetails?.nome) return 'U';
    
    return userDetails.nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Bell className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={userDetails?.avatar_url || "/placeholder.svg?height=32&width=32"} 
                alt={userDetails?.nome || "Usuário"} 
              />
              <AvatarFallback className="bg-cyan-700">{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userDetails?.nome || "Usuário"}</p>
              <p className="text-xs leading-none text-muted-foreground">{userDetails?.email || "usuário@exemplo.com"}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut || isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
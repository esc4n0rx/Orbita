"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/profile-settings"
import { AppearanceSettings } from "@/components/appearance-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { AppLayout } from "@/components/app-layout"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Verificar autenticação
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
          <p className="text-md text-slate-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Configurações">
      <div className="space-y-4 p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Gerencie suas configurações de conta e preferências</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="appearance">Aparência</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <ProfileSettings />
              </TabsContent>
              <TabsContent value="appearance" className="space-y-4">
                <AppearanceSettings />
              </TabsContent>
              <TabsContent value="notifications" className="space-y-4">
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
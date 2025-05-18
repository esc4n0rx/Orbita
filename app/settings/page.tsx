import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/profile-settings"
import { AppearanceSettings } from "@/components/appearance-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { AppLayout } from "@/components/app-layout"

export default function SettingsPage() {
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

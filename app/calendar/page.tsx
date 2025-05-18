import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"
import { UpcomingEvents } from "@/components/upcoming-events"
import { AppLayout } from "@/components/app-layout"

export default function CalendarPage() {
  return (
    <AppLayout title="Calendário">
      <div className="space-y-4 p-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Dia
            </Button>
            <Button variant="outline" size="sm">
              Semana
            </Button>
            <Button variant="default" size="sm">
              Mês
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Visualize e gerencie seus compromissos</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos agendados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingEvents />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

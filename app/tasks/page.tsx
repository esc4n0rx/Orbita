import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { AppLayout } from "@/components/app-layout"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { CategoryDialog } from "@/components/category-dialog"

export default function TasksPage() {
  return (
    <AppLayout title="Tarefas">
      <div className="space-y-4 p-4 pb-20">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organize suas tarefas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDialog />
              </CardContent>
            </Card>
            <TaskList expanded={true} />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <TaskList expanded={true} filterStatus="pending" />
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <TaskList expanded={true} filterStatus="completed" />
          </TabsContent>
          <TabsContent value="recurring" className="space-y-4">
            <TaskList expanded={true} filterStatus="recurring" />
          </TabsContent>
        </Tabs>

        <NewTaskDialog />
      </div>
    </AppLayout>
  )
}

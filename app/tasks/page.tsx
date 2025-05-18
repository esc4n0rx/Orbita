import ClientProviders from "@/components/client-providers";
import TasksPageContent from "./tasks-content"

export default function TasksPage() {
  return (
    <ClientProviders>
      <TasksPageContent />
    </ClientProviders>
  );
}
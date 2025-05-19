import ClientProviders from "@/components/client-providers";
import EditTaskPage from "./edit-task-content"

export default function TaskEditPage({ params }: { params: { id: string } }) {
  return (
    <ClientProviders>
      <EditTaskPage id={params.id} />
    </ClientProviders>
  );
}
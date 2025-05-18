import ClientProviders from "@/components/client-providers";
import DashboardPage from "./dashboard-content"

export default function Dashboard() {
  return (
    <ClientProviders>
      <DashboardPage />
    </ClientProviders>
  );
}
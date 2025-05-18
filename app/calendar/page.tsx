import ClientProviders from "@/components/client-providers";
import CalendarPageContent from "./calendar-content"

export default function CalendarPage() {
  return (
    <ClientProviders>
      <CalendarPageContent />
    </ClientProviders>
  );
}
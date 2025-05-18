import ClientProviders from "@/components/client-providers";
import SettingsPageContent from "./settings-content"

export default function SettingsPage() {
  return (
    <ClientProviders>
      <SettingsPageContent />
    </ClientProviders>
  );
}
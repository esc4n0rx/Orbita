import ClientProviders from "@/components/client-providers";
import AuthPage from "./auth-page"

export default function HomePage() {
  return (
    <ClientProviders>
      <AuthPage />
    </ClientProviders>
  );
}
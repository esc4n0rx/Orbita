import ClientProviders from "@/components/client-providers";
import AuthCallbackContent from "./auth-callback-content"

export default function AuthCallbackPage() {
  return (
    <ClientProviders>
      <AuthCallbackContent />
    </ClientProviders>
  );
}
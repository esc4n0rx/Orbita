"use client";

import { Loader2 } from "lucide-react";

export function LoadingSpinner({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-md text-slate-400">{message}</p>
      </div>
    </div>
  );
}
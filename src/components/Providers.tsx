"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { ToastContainer } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </I18nProvider>
  );
}

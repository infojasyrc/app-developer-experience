// app/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "./shared/lib/queryClient";
import { isDevelopment } from "./shared/environment";
import { LayoutProvider, UserProvider } from "./lib/contexts";
import { AuthProvider } from "./lib/contexts/Auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AuthProvider>
          <LayoutProvider>
            {children}
            {isDevelopment() && <ReactQueryDevtools initialIsOpen={false} />}
          </LayoutProvider>
        </AuthProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

// app/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "./lib/queryClient";
import { isDevelopment } from "./shared/environment";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment() && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // controls how long data remains fresh
            staleTime: 60 * 1000, // 1 minute

            // controls how long unused/inactive cache data remains in cache
            gcTime: 5 * 60 * 1000, // 5 minutes

            // disable automatic refetching on window focus
            refetchOnWindowFocus: false,

            // retry failed requests once before displaying an error
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

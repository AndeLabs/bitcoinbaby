"use client";

/**
 * React Query Provider
 *
 * Configures TanStack Query with optimal settings for blockchain data:
 * - Stale time: 30s (blockchain data changes slowly)
 * - Background refetch on window focus
 * - Retry with exponential backoff
 * - Error boundaries
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create client in state to avoid recreation on re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Blockchain data is relatively stable
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)

            // Refetch behaviors
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,

            // Retry with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),

            // Don't refetch too aggressively
            refetchInterval: false,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;

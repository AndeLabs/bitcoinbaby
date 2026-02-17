"use client";

/**
 * RootProvider - Wrapper para hydration de Zustand stores
 *
 * Asegura que los stores de Zustand se hidraten correctamente
 * en el cliente y provee contexto global para la app.
 */

import { useEffect, useState, type ReactNode } from "react";

interface RootProviderProps {
  children: ReactNode;
}

/**
 * RootProvider Component
 *
 * Handles Zustand store hydration and provides global context.
 * This prevents hydration mismatches with persisted state.
 */
export function RootProvider({ children }: RootProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and initial hydration, render a minimal version
  // to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-pixel-bg-dark">
        {/* Loading placeholder during hydration */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="font-pixel text-pixel-primary text-sm animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if hydration is complete
 * Useful for components that need to wait for store data
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

export default RootProvider;

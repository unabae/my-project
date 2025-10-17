"use client";

import { useSession } from "@/hooks/useAuth";
import Loading from "@/components/Loading";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useSession();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error loading session: {error.message}</div>;
  }

  return children;
}

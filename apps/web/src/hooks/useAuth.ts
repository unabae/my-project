// hooks/use-auth.ts
"use client";

import { useRouter } from "next/navigation";
import { useApiMutation, useApiQuery } from "./useApi";

interface SignUpForm {
  email: string;
  password: string;
  name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  expiresAt: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string;
  userAgent: string;
  userId: string;
}

export interface SessionData {
  session: Session;
  user: User;
}

export function useSession() {
  const { data, isLoading, error } = useApiQuery<SessionData>(
    "/api/auth/get-session",
    ["session"],
    {
      // Refetch session every 5 minutes
      staleTime: 5 * 60 * 1000,
    }
  );

  console.log("Session data:", data);
  console.log("Session loading:", isLoading);
  console.log("Session error:", error);

  return { session: data, isLoading, error };
}

export function useSignUp() {
  const router = useRouter();

  return useApiMutation<unknown, SignUpForm>(
    "/api/auth/sign-up/email",
    "POST",
    {
      invalidateKeys: [["session"]], // Invalidate session cache to refetch
      onSuccess: () => {
        router.push("/");
        router.refresh();
      },
    }
  );
}

export function useSignIn() {
  const router = useRouter();

  return useApiMutation<unknown, Omit<SignUpForm, "name">>(
    "/api/auth/sign-in/email",
    "POST",
    {
      invalidateKeys: [["session"]], // Invalidate session cache to refetch
      onSuccess: async () => {
        await router.push("/");
        // router.refresh();
      },
    }
  );
}

export function useSignOut() {
  const router = useRouter();

  return useApiMutation<unknown, void>("/api/auth/sign-out", "POST", {
    invalidateKeys: [["session"]], // Invalidate session cache to refetch
    onSuccess: async () => {
      // await router.push("/auth/login");
      // router.refresh();
    },
  });
}

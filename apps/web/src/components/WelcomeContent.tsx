"use client";

import { useSession } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSignOut } from "@/hooks/useAuth";

export function WelcomeContent() {
  const { session, isLoading } = useSession();
  const signOutMutation = useSignOut();

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {!session ? (
        <>
          <h1 className="text-3xl font-bold">Welcome to Our App</h1>
          <Button asChild size="lg">
            <Link href="/auth/login">Sign In / Sign Up</Link>
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">
            Welcome {session.user?.name || "back"}!
          </h1>
          <div>
            <Button asChild size="lg">
              <Link href="/n8n">Tiktok - Youtube</Link>
            </Button>
          </div>
          <Button size="lg" variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </>
      )}
    </div>
  );
}

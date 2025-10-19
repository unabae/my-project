"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInTab } from "./_components/sign-in-tab";
import { SignUpTab } from "./_components/sign-up-tab";

export default function LoginPage() {
  // Use a more React-friendly approach for hydration mismatch prevention
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to defer the state update to the next tick
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Tabs defaultValue="signin" className="max-auto w-full my-6 px-4">
      <TabsList>
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sign In Tab Component */}
            <SignInTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sign Up Tab Component */}
            <SignUpTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

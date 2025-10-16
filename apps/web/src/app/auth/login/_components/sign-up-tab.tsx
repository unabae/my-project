"use client";

import { useState } from "react";
import { set, useForm } from "react-hook-form";
import { SignUpForm, signUpSchema } from "shared/index";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useSignUp } from "@/hooks/useAuth";

export function SignUpTab() {
  const [error, setError] = useState<string | null>(null);
  const handleSignUp = useSignUp();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = (data: SignUpForm) => {
    handleSignUp.mutate(data);
  };

  // The old way using fetch
  // async function handleSignUp(data: SignUpForm) {
  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-up/email`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(data),
  //         credentials: "include", // so cookies/session are stored
  //       }
  //     );

  //     const result = await res.json();

  //     if (!res.ok) {
  //       setError(result.message || "Sign up failed");
  //       console.error("Sign up failed:", result);
  //       return;
  //     }

  //     console.log("Sign up success:", result);
  //     // Optionally redirect or show a success toast
  //   } catch (error) {
  //     setError("An unexpected error occurred");
  //     console.error("Error during signup:", error);
  //   }
  // }

  // The new way using better-auth client (client way)
  // async function handleSignUp(data: SignUpForm) {
  //   await authClient.signUp.email(
  //     { ...data, callbackURL: "/" },
  //     {
  //       onError: (error) => {
  //         setError(error.error.message);
  //       },
  //     }
  //   );
  // }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <Button type="submit">Sign Up</Button>
      </form>
    </Form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useSignIn } from "@/hooks/useAuth";
import { useTransition } from "react";

// Sign-in only needs email and password
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInTab() {
  const router = useRouter();
  const signInMutation = useSignIn();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (data: SignInForm) => {
    signInMutation.mutate(data);
  };

  // const handleSubmit = (data: SignInForm) => {
  //   signInMutation.mutate(data, {
  //     onSuccess: async () => {
  //       startTransition(async () => {
  //         await router.push("/");
  //       });
  //     },
  //   });
  // };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        {signInMutation.isError && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {signInMutation.error?.message ||
              "Sign in failed. Please check your credentials."}
          </div>
        )}

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

        {/* <Button type="submit" disabled={signInMutation.status === "pending"}>
          {signInMutation.status === "pending" && "Signing in..."}
          {signInMutation.status === "success" && "Signed In! ✓"}
          {(signInMutation.status === "idle" ||
            signInMutation.status === "error") &&
            "Sign In"}
        </Button> */}

        {/* <Button type="submit" disabled={signInMutation.isPending}>
          {signInMutation.isPending ? "Signing in..." : "Sign In"}
        </Button> */}
        
        <Button type="submit" disabled={signInMutation.status === "pending"}>
          {signInMutation.status === "pending" ? "Signing in..." : "Sign In"}
        </Button>
        {/* <Button
          type="submit"
          disabled={signInMutation.status === "pending" || isPending}
        >
          {signInMutation.status === "pending" || isPending
            ? "Signing in..."
            : "Sign In"}
        </Button> */}
      </form>
    </Form>
  );
}

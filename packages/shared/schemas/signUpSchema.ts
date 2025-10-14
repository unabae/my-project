import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  password: z.string().min(6),
});

export type SignUpForm = z.infer<typeof signUpSchema>;

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db"; // your drizzle instance
import { openAPI } from "better-auth/plugins";
import { sendEmail } from "../emails/send-email";
import { EmailTemplate } from "../emails/email-template";
import * as authSchema from "../schema/auth-schema";

// Configure better-auth with Drizzle adapter and email/password provider

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: EmailTemplate({ firstName: user.name ?? "there", url }),
      });
    },
  },
  plugins: [openAPI()],
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db"; // your drizzle instance
import { openAPI } from "better-auth/plugins";

// Configure better-auth with Drizzle adapter and email/password provider

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
});

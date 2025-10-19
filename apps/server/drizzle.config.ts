import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/config/env";

export default defineConfig({
  schema: [
    "./src/schema/auth-schema.ts",
    "./src/schema/tiktok-to-youtube-schema.ts",
  ],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL!,
  },
});

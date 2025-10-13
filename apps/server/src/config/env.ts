import { config } from "dotenv";

// Central place for configuration = environment variables, constants, etc.

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const { PORT, NODE_ENV, DATABASE_URL, FRONTEND_URL, RESEND_API_KEY } =
  process.env;

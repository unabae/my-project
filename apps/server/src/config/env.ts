import { config } from "dotenv";

// Central place for configuration = environment variables, constants, etc.

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

// Expect the following env vars for the n8n integration:
// - N8N_BASE_URL    e.g. https://primary-production-.../ (include trailing slash)
// - N8N_JWT_SECRET  shared HS256 secret also configured inside n8n's JWT node

export const {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  FRONTEND_URL,
  RESEND_API_KEY,
  N8N_BASE_URL,
  N8N_JWT_SECRET,
} = process.env;

import { cors } from "hono/cors";
import { FRONTEND_URL } from "../config/env";

export const corsMiddleware = cors({
  origin: `${FRONTEND_URL}`,
  credentials: true,
});

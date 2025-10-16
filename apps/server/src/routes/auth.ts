// src/routes/auth.ts
import { Hono } from "hono";
import { auth } from "../lib/auth";

export const authRoutes = new Hono();

authRoutes.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

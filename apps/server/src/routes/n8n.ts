/*
  n8n Routes
  ----------
  Exposes REST endpoints that proxy requests into n8n workflows. Each handler should
  focus on request validation and rely on the n8n service for JWT creation plus HTTP
  transport.

  `/api/n8n/test`
    - Accepts `tiktokLink` and `videoDescription` in the body (both required).
    - Validates input using Zod schema.
    - Generates a JWT, forwards the payload to the configured n8n webhook, and returns
      the n8n response (or propagates errors with a 500).
    - Useful for manual verification from the frontend `/n8n` page.
*/
import { Hono } from "hono";
import { postN8nResume, postN8nTest } from "../controllers/n8nController";
import type { AppType } from "../types/appTypes";

export const n8nRoutes = new Hono<AppType>();

n8nRoutes.post("/api/n8n/test", postN8nTest);
n8nRoutes.post("/api/n8n/resume", postN8nResume);

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
import { callN8nWebhook } from "../services/n8nService";
import { n8nTestSchema } from "shared";
import type { AppType } from "../types/appTypes";

export const n8nRoutes = new Hono<AppType>();

n8nRoutes.post("/api/n8n/test", async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json().catch(() => ({}));
    const validationResult = n8nTestSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          ok: false,
          error: "Validation failed",
          details: validationResult.error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        400
      );
    }

    const { tiktokLink, videoDescription } = validationResult.data;

    const payload = {
      tiktokLink,
      videoDescription,
      triggeredAt: new Date().toISOString(),
    };

    const data = await callN8nWebhook(
      "webhook-test/1ff0ba3d-a75b-4b02-855c-34cd5f2c0672",
      payload
    );

    return c.json({ ok: true, data });
  } catch (error) {
    console.error("Failed to trigger n8n webhook", error);

    let errorPayload: unknown = "Unknown n8n webhook error";

    if (error instanceof Error) {
      try {
        errorPayload = JSON.parse(error.message);
      } catch {
        errorPayload = error.message;
      }
    }

    return c.json({ ok: false, error: errorPayload }, 500);
  }
});

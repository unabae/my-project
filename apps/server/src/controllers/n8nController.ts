import type { Context } from "hono";
import { n8nResumeSchema, n8nTestSchema } from "shared";
import { callN8nWebhook } from "../services/n8nService";
import type { AppType } from "../types/appTypes";
import { N8N_BASE_URL } from "../config/env";

export const postN8nTest = async (c: Context<AppType>) => {
  try {
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

    const { tiktokLink, videoDescription, scheduledDate } =
      validationResult.data;

    const payload = {
      tiktokLink,
      videoDescription,
      triggeredAt: new Date().toISOString(),
      scheduledDate: new Date(scheduledDate).toISOString(),
    };

    const session = c.get("session");

    const data = await callN8nWebhook(
      "webhook-test/1ff0ba3d-a75b-4b02-855c-34cd5f2c0672",
      payload,
      {
        tokenPayload: {
          sessionId: session?.id,
          userId: session?.userId,
        },
      }
    );

    const resumeUrl =
      data && typeof data === "object"
        ? (data as { resumeUrl?: string }).resumeUrl
        : undefined;

    return c.json({ ok: true, data, resumeUrl });
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
};

export const postN8nResume = async (c: Context<AppType>) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const validationResult = n8nResumeSchema.safeParse(body);

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

    const { resumeUrl, payload } = validationResult.data;

    if (!N8N_BASE_URL) {
      return c.json(
        { ok: false, error: "N8N base URL is not configured on the server" },
        500
      );
    }

    const baseUrl = new URL(N8N_BASE_URL);
    const targetUrl = new URL(resumeUrl);

    if (baseUrl.origin !== targetUrl.origin) {
      return c.json(
        {
          ok: false,
          error: "Resume URL does not match the configured n8n base URL",
        },
        400
      );
    }

    const pathWithSearch = `${targetUrl.pathname}${targetUrl.search}`;
    const session = c.get("session");

    const data = await callN8nWebhook(
      pathWithSearch,
      payload ?? {},
      {
        tokenPayload: {
          sessionId: session?.id,
          userId: session?.userId,
        },
      }
    );

    return c.json({ ok: true, data });
  } catch (error) {
    console.error("Failed to post n8n resume payload", error);

    let errorPayload: unknown = "Unknown resume webhook error";

    if (error instanceof Error) {
      try {
        errorPayload = JSON.parse(error.message);
      } catch {
        errorPayload = error.message;
      }
    }

    return c.json({ ok: false, error: errorPayload }, 500);
  }
};

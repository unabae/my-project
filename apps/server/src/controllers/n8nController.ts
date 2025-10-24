import type { Context } from "hono";
import { n8nResumeSchema, n8nTestSchema } from "shared";
import { callN8nWebhook } from "../services/n8nService";
import type { AppType } from "../types/appTypes";
import { N8N_BASE_URL } from "../config/env";

// Handles the initial "test" trigger that kicks off the TikTok -> YouTube workflow inside n8n.
export const postN8nTest = async (c: Context<AppType>) => {
  try {
    // Parse the incoming JSON payload; fall back to an empty object for malformed bodies.
    const body = await c.req.json().catch(() => ({}));
    const validationResult = n8nTestSchema.safeParse(body);

    // Surface validation errors to the UI with field level details.
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

    const { tiktokLink, videoDescription, scheduledDate, scheduledTime } =
      validationResult.data;

    // Normalize the scheduled timestamp so n8n always receives an ISO string.
    const scheduledDateTime = scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}:00`)
      : new Date(scheduledDate);

    const payload = {
      tiktokLink,
      videoDescription,
      triggeredAt: new Date().toISOString(),
      scheduledDate: scheduledDateTime.toISOString(),
    };

    // Pull the authenticated session from Hono context to enrich the JWT payload.
    const session = c.get("session");

    // callN8nWebhook signs a JWT, calls the configured webhook, and returns the n8n response body.
    const data = await callN8nWebhook(
      "webhook/1ff0ba3d-a75b-4b02-855c-34cd5f2c0672",
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

    // Standardize the error shape; n8n may stuff JSON inside the thrown error message.
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

// Handles posting user edits back to the resume webhook that continues the n8n workflow.
export const postN8nResume = async (c: Context<AppType>) => {
  try {
    // Accept the resume data and validate the shape (resume url + optional payload).
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
      // Without a base URL we cannot safely determine where to send the resume payload.
      return c.json(
        { ok: false, error: "N8N base URL is not configured on the server" },
        500
      );
    }

    const baseUrl = new URL(N8N_BASE_URL);
    const targetUrl = new URL(resumeUrl);

    // Guard against open redirect / SSRF by ensuring the resume URL matches our n8n instance.
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

    // Re-use the webhook helper so the resume call is authenticated the same way as the trigger.
    const data = await callN8nWebhook(pathWithSearch, payload ?? {}, {
      tokenPayload: {
        sessionId: session?.id,
        userId: session?.userId,
      },
    });

    return c.json({ ok: true, data });
  } catch (error) {
    console.error("Failed to post n8n resume payload", error);

    // Align error responses with the trigger handler.
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

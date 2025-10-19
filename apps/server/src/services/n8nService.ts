/*
  n8n Service
  ------------
  Service layer for n8n integration that handles JWT token creation and webhook calls.
  This separates the business logic from the route handlers.

  How it works:
  1. `issueN8nToken` signs a short-lived JWT using the shared secret stored in
     `N8N_JWT_SECRET`. The token carries a default `scope` claim plus any caller-supplied
     payload, and sets explicit `exp`, `iss`, and `aud` claims so n8n can validate it.
  2. `callN8nWebhook` constructs the webhook URL from `N8N_BASE_URL`, obtains a token,
     and performs a POST request with the token in the `Authorization` header.
  3. Errors bubble up with the full n8n response body attached, making it easier to debug
     misconfigurations or workflow failures.

  Requirements:
  - Environment variables `N8N_BASE_URL` (e.g. https://.../ ) and `N8N_JWT_SECRET`
    must be defined for the current Bun process.
  - n8n should include a JWT node (or equivalent) configured with the same secret,
    algorithm HS256, issuer `my-backend`, and audience `n8n`.
  - Callers can tailor the payload per request by passing `tokenPayload` so n8n receives
    additional claims (user ids, scopes, etc.).

  Usage:
    const result = await callN8nWebhook("webhook-test/...", { foo: "bar" });
    // result resolves to the JSON body returned by n8n (if any).
*/
import { sign } from "hono/jwt";
import { N8N_BASE_URL, N8N_JWT_SECRET } from "../config/env";

type N8nTokenPayload = Record<string, unknown>;

/** Issues a short-lived JWT using the shared secret configured for n8n. */
export const issueN8nToken = async (
  payload: N8nTokenPayload = {}
): Promise<string> => {
  if (!N8N_JWT_SECRET) {
    throw new Error("N8N_JWT_SECRET is not configured");
  }

  // JWT claims follow the same naming n8n's JWT node validates by default.
  const claims = {
    scope: "n8n",
    expiration: Math.floor(Date.now() / 1000) + 60 * 5,
    issuer: "my-backend",
    audience: "n8n",
    ...payload,
  };

  return sign(claims, N8N_JWT_SECRET, "HS256");
};

type CallN8nOptions = {
  tokenPayload?: N8nTokenPayload;
  init?: RequestInit;
};

/** Sends a POST request to an n8n webhook with the signed JWT attached. */
export const callN8nWebhook = async <TResponse = unknown>(
  path: string,
  body: unknown,
  options: CallN8nOptions = {}
): Promise<TResponse> => {
  if (!N8N_BASE_URL) {
    throw new Error("N8N_BASE_URL is not configured");
  }

  const token = await issueN8nToken(options.tokenPayload);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, N8N_BASE_URL).toString();

  const init: RequestInit = {
    method: "POST",
    ...options.init,
  };

  const headers = new Headers(options.init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // keep raw text
    }
    throw new Error(
      // `n8n request failed (${response.status} ${response.statusText}): ${text}`
      JSON.stringify(parsed)
    );
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    return undefined as TResponse;
  }
};

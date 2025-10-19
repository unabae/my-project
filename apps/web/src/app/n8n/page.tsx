"use client";

/*
  /n8n Test Page
  --------------
  Provides a minimal UI for exercising the end-to-end Bun → n8n JWT handshake.

  Flow:
    1. The form submission triggers `useApiMutation` against the backend endpoint
       `/api/n8n/test`.
    2. The Bun route (`apps/server/src/routes/n8n.ts`) signs a JWT with the shared
       secret, forwards the payload to the Railway-hosted n8n webhook, and returns the
       workflow response.
    3. TanStack Query tracks the mutation status so the UI can surface loading,
       success, and error states.

  Tips:
    - Leave the message empty to use the default text the backend expects.
    - n8n’s response body (if any) is rendered verbatim for quick inspection.
    - Extend this page when you need richer debugging aids (headers, timing, etc.).
*/

import { FormEvent, useState } from "react";
import { useApiMutation } from "../../hooks/useApi";
import { Input } from "@/components/ui/input";
import { formatValidationErrors } from "@/lib/validation-utils";
import { AxiosError } from "axios";

type N8nTriggerResponse = {
  ok: boolean;
  data?: unknown;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
};

type N8nTriggerPayload = {
  tiktokLink: string;
  videoDescription: string;
};

export default function N8nTestPage() {
  const [tiktokLink, setTiktokLink] = useState<string>("");
  const [videoDescription, setVideoDescription] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const mutation = useApiMutation<N8nTriggerResponse, N8nTriggerPayload>(
    "/api/n8n/test"
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({}); // Clear previous errors
    mutation.mutate(
      { tiktokLink, videoDescription },
      {
        onSuccess: () => {
          setTiktokLink("");
          setVideoDescription("");
        },
        onError: (
          error: AxiosError<{
            error?: unknown;
            details?: Array<{ field: string; message: string }>;
          }>
        ) => {
          if (error.response?.data?.details) {
            setErrors(formatValidationErrors(error.response.data.details));
          }
        },
      }
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Tiktok Downloader - Youtube</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-border p-6 shadow-sm"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">TikTok Link</span>
          <Input
            value={tiktokLink}
            onChange={(event) => setTiktokLink(event.target.value)}
            placeholder="Paste your Tiktok URL here"
            className="rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {errors.tiktokLink?.map((error, index) => (
          <p key={index} className="text-red-500 text-sm">
            {error}
          </p>
        ))}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">What is the video about?</span>
          <Input
            value={videoDescription}
            onChange={(event) => setVideoDescription(event.target.value)}
            placeholder=""
            className="rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {errors.videoDescription?.map((error, index) => (
          <p key={index} className="text-red-500 text-sm">
            {error}
          </p>
        ))}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Calling n8n..." : "Trigger n8n Webhook"}
        </button>
      </form>

      <section className="rounded-lg border border-border p-4 text-sm">
        <h2 className="mb-2 font-medium">Result</h2>
        {mutation.isIdle && <p>Waiting for a trigger.</p>}
        {mutation.isPending && <p>Sending request...</p>}
        {mutation.isSuccess && (
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
            {(mutation.data?.data as { message?: string })?.message ??
              JSON.stringify(mutation.data, null, 2)}
          </pre>
        )}
        {mutation.isError && (
          <div className="text-destructive space-y-2">
            <div className="border-b border-destructive/20 pb-2">
              <h3 className="font-medium mb-2">Error Details</h3>
              <div className="space-y-1 text-sm bg-destructive/5 p-3 rounded">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {(mutation.error as AxiosError)?.message}
                </p>
                {(mutation.error as AxiosError<{ error: string }>)?.response
                  ?.data?.error && (
                  <p>
                    <span className="font-medium">Message:</span>{" "}
                    {
                      (mutation.error as AxiosError<{ error: string }>)
                        ?.response?.data?.error
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

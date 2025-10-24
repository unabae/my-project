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
import { Button } from "@/components/ui/button";

type N8nTriggerResponse = {
  ok: boolean;
  data?: unknown;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  resumeUrl?: string;
};

type N8nTriggerPayload = {
  tiktokLink: string;
  videoDescription: string;
  scheduledDate: string;
  scheduledTime?: "00:00" | "05:00" | "07:00";
};

type N8nWorkflowItem = {
  output?: {
    title?: string;
    description?: string;
    tags?: string;
    userId?: string;
    generated_at?: string;
    scheduled_date?: string;
  };
  resumeUrl?: string;
};

type ResumePayload = {
  resumeUrl: string;
  payload?: {
    title?: string;
    description?: string;
    tags?: string;
  };
};

type EditableOutput = {
  title: string;
  description: string;
  tags: string;
};

// Normalize the workflow response regardless of whether n8n returned an array or single object.
const getWorkflowEntry = (payload: unknown): N8nWorkflowItem | undefined => {
  if (Array.isArray(payload)) {
    return (payload[0] as N8nWorkflowItem) ?? undefined;
  }
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as N8nWorkflowItem;
  }
  return undefined;
};

// Prepare a user-editable snapshot of the generated metadata, defaulting blank fields.
const toEditableOutput = (
  output?: N8nWorkflowItem["output"]
): EditableOutput => ({
  title: output?.title ?? "",
  description: output?.description ?? "",
  tags: output?.tags ?? "",
});

export default function N8nTestPage() {
  const [tiktokLink, setTiktokLink] = useState<string>("");
  const [videoDescription, setVideoDescription] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<
    "00:00" | "05:00" | "07:00"
  >("00:00");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Mutation encapsulates the POST to our Bun bridge that triggers the n8n workflow.
  const mutation = useApiMutation<N8nTriggerResponse, N8nTriggerPayload>(
    "/api/n8n/test"
  );
  const axiosError = mutation.error as AxiosError | undefined;
  const workflowPayload = mutation.data?.data;
  const workflowEntry = getWorkflowEntry(workflowPayload);
  const resumeUrl = mutation.data?.resumeUrl ?? workflowEntry?.resumeUrl;

  const [editableOutput, setEditableOutput] = useState<EditableOutput>(
    toEditableOutput(workflowEntry?.output)
  );
  const [resumeStatus, setResumeStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Separate mutation hits the resume endpoint that pushes edits back to n8n.
  const resumeMutation = useApiMutation<
    { ok: boolean; data?: unknown },
    ResumePayload
  >("/api/n8n/resume");

  const isPosting = resumeStatus === "pending" || resumeMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({}); // Clear previous errors
    // Send the form values to the workflow trigger and reconcile the UI with the reply.
    mutation.mutate(
      { tiktokLink, videoDescription, scheduledDate, scheduledTime },
      {
        onSuccess: (response) => {
          // Persist the freshly generated metadata so the user can refine it.
          const entry = getWorkflowEntry(response.data);
          setEditableOutput(toEditableOutput(entry?.output));
          setResumeStatus("idle");
          setResumeError(null);
          // setTiktokLink("");
          // setVideoDescription("");
          // setScheduledDate("");
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

  const handleResume = (url: string | undefined, output: EditableOutput) => {
    if (!url) return;

    setResumeStatus("pending");
    setResumeError(null);

    // Only persist fields that the user actually filled out; omit empty strings.
    const payload: ResumePayload["payload"] =
      output && (output.title || output.description || output.tags)
        ? {
            title: output.title || undefined,
            description: output.description || undefined,
            tags: output.tags || undefined,
          }
        : {};

    // Forward the edited payload to the resume webhook so n8n can continue the workflow.
    resumeMutation.mutate(
      {
        resumeUrl: url,
        payload,
      },
      {
        onSuccess: () => {
          setResumeStatus("success");
        },
        onError: (error) => {
          // Surface the server's error message when possible; fall back to Axios defaults.
          setResumeStatus("error");
          const message =
            error.displayMessage ??
            (typeof error.response?.data?.error === "string"
              ? error.response.data.error
              : error.message);
          setResumeError(message ?? "Failed to post resume payload");
        },
      }
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Tiktok Downloader - Youtube</h1>
      </header>

      {/* Form collects the parameters required to trigger the n8n workflow */}
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
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Publish Date</span>
          <Input
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            className="rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {errors.scheduledDate?.map((error, index) => (
          <p key={index} className="text-red-500 text-sm">
            {error}
          </p>
        ))}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">
            Preferred Publish Time
          </legend>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "12:00 AM", value: "00:00" as const },
              { label: "5:00 AM", value: "05:00" as const },
              { label: "7:00 AM", value: "07:00" as const },
            ].map((option) => (
              <label
                key={option.value}
                className="inline-flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="scheduledTime"
                  value={option.value}
                  checked={scheduledTime === option.value}
                  onChange={() => setScheduledTime(option.value)}
                  className="h-4 w-4 border border-input text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {errors.scheduledTime?.map((error, index) => (
          <p key={index} className="text-red-500 text-sm">
            {error}
          </p>
        ))}

        <Button
          type="submit"
          className="inline-flex items-center justify-center cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Calling n8n..." : "Generate Video Details"}
        </Button>
      </form>

      {/* Result panel reflects the current mutation and resume status */}
      <section className="rounded-lg border border-border p-4 text-sm">
        <h2 className="mb-2 font-medium">Result</h2>
        {mutation.isIdle && <p>Waiting for your submission</p>}
        {mutation.isPending && <p>Sending request...</p>}
        {mutation.isSuccess && (
          <>
            <div className="mb-4 space-y-4 rounded-md border border-muted-foreground/20 bg-muted/30 p-4 text-xs">
              <div className="space-y-2">
                <p className="font-medium">Resume URL</p>
                {resumeUrl ? (
                  <p>{resumeUrl}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Workflow did not return a resume URL.
                  </p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Title
                  </span>
                  <Input
                    value={editableOutput.title}
                    onChange={(event) => {
                      setEditableOutput((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }));
                      setResumeStatus("idle");
                      setResumeError(null);
                    }}
                    placeholder="Generated title"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Description
                  </span>
                  <textarea
                    value={editableOutput.description}
                    onChange={(event) => {
                      setEditableOutput((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }));
                      setResumeStatus("idle");
                      setResumeError(null);
                    }}
                    className="min-h-[140px] rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Generated description"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Tags (comma separated)
                  </span>
                  <Input
                    value={editableOutput.tags}
                    onChange={(event) => {
                      setEditableOutput((prev) => ({
                        ...prev,
                        tags: event.target.value,
                      }));
                      setResumeStatus("idle");
                      setResumeError(null);
                    }}
                    placeholder="Generated tags"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => handleResume(resumeUrl, editableOutput)}
                  className="w-full inline-flex items-center rounded bg-primary px-3 py-1 text-md text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  disabled={!resumeUrl || isPosting}
                >
                  {isPosting ? "Posting..." : "Post to Youtube"}
                </Button>
              </div>

              {resumeStatus === "success" && (
                <p className="text-lg text-emerald-600">
                  Successfully uploaded to Youtube.
                </p>
              )}
              {resumeStatus === "error" && resumeError && (
                <p className="text-lg text-destructive">{resumeError}</p>
              )}
            </div>
            {/* <div className="space-y-2">
              <p className="font-medium text-xs uppercase text-muted-foreground">
                Raw Response
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs rounded border border-border bg-muted/20 p-3">
                {JSON.stringify(
                  mutation.data?.data ?? mutation.data,
                  null,
                  2
                )}
              </pre>
            </div> */}
          </>
        )}
        {mutation.isError && (
          <div className="text-destructive space-y-2">
            <div className="border-b border-destructive/20 pb-2">
              <h3 className="font-medium mb-2">Error Details</h3>
              <div className="space-y-1 text-sm bg-destructive/5 p-3 rounded">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {axiosError?.message ?? mutation.error?.message}
                </p>
                {axiosError?.displayMessage && (
                  <div>
                    <p className="font-medium">Message:</p>
                    <pre className="mt-1 whitespace-pre-wrap break-words">
                      {axiosError.displayMessage}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

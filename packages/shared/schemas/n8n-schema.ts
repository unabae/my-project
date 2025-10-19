/*
  n8n Validation Schema
  ---------------------
  Validation schemas for n8n webhook requests to ensure data integrity.
*/
import { z } from "zod";

// TikTok URL validation regex - matches common TikTok URL patterns
const tiktokUrlRegex =
  /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com|vt\.tiktok\.com)\/.+/;

export const n8nTestSchema = z.object({
  tiktokLink: z
    .string()
    .min(1, "TikTok link is required")
    .regex(tiktokUrlRegex, "Please provide a valid TikTok URL"),
  videoDescription: z
    .string()
    .min(1, "Video description is required")
    .max(500, "Video description must be less than 500 characters"),
  scheduledDate: z
    .string()
    .min(1, "Scheduled date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Please select a valid date",
    }),
});

export type N8nTestRequest = z.infer<typeof n8nTestSchema>;

export const n8nResumeSchema = z.object({
  resumeUrl: z
    .string()
    .url("Resume URL must be a valid URL")
    .min(1, "Resume URL is required"),
  payload: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.string().optional(),
    })
    .optional()
    .default({}),
});

export type N8nResumeRequest = z.infer<typeof n8nResumeSchema>;

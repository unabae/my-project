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
    .min(10, "Video description must be at least 10 characters long")
    .max(500, "Video description must be less than 500 characters"),
});

export type N8nTestRequest = z.infer<typeof n8nTestSchema>;

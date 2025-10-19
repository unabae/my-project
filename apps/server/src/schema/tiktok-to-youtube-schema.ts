import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const generatedVideo = pgTable("generated_video", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  videoDescription: text("video_description"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  url: text("url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

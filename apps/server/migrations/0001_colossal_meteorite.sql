CREATE TABLE "generated_video" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"video_description" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generated_video" ADD CONSTRAINT "generated_video_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;